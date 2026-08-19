#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <RTClib.h>
#include <SPI.h>
#include <SD.h>
#include <time.h>

#include "secrets.h"

#define SD_CS 5

RTC_DS3231 rtc;

// =========================
// SERVIDOR
// =========================

// IP do computador onde esta o Spring Boot
const char* servidor = "http://192.168.1.9:8080/api/medicoes";

// UTC-3
const long gmtOffset_sec = -3 * 3600;
const int daylightOffset_sec = 0;

const char* ntpServer1 = "pool.ntp.org";
const char* ntpServer2 = "time.google.com";

// Tentativa de reconexao a cada 10 segundos
unsigned long ultimaTentativaWiFi = 0;
const unsigned long intervaloReconexao = 10000;


// ======================================================
// GERAR ID DA MEDICAO
// ======================================================

String gerarMedicaoId(DateTime dataHora) {

  char id[40];

  snprintf(
    id,
    sizeof(id),
    "ESP32-%04d%02d%02d-%02d%02d%02d",
    dataHora.year(),
    dataHora.month(),
    dataHora.day(),
    dataHora.hour(),
    dataHora.minute(),
    dataHora.second()
  );

  return String(id);
}


// ======================================================
// FORMATAR DATA/HORA
// ======================================================

String formatarDataHora(DateTime dataHora) {

  char resultado[25];

  snprintf(
    resultado,
    sizeof(resultado),
    "%04d-%02d-%02dT%02d:%02d:%02d",
    dataHora.year(),
    dataHora.month(),
    dataHora.day(),
    dataHora.hour(),
    dataHora.minute(),
    dataHora.second()
  );

  return String(resultado);
}


// ======================================================
// CONECTAR AO WI-FI
// ======================================================

void conectarWiFi() {

  Serial.println("Conectando ao Wi-Fi...");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int tentativas = 0;

  while (
    WiFi.status() != WL_CONNECTED &&
    tentativas < 20
  ) {

    delay(500);
    Serial.print(".");
    tentativas++;
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {

    Serial.println("Wi-Fi conectado!");

    Serial.print("IP do ESP32: ");
    Serial.println(WiFi.localIP());

  } else {

    Serial.println("Nao foi possivel conectar ao Wi-Fi.");
    Serial.println("Sistema continuara em modo offline.");
  }
}


// ======================================================
// VERIFICAR / RECONECTAR WI-FI
// ======================================================

void verificarWiFi() {

  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  unsigned long agora = millis();

  if (
    agora - ultimaTentativaWiFi <
    intervaloReconexao
  ) {
    return;
  }

  ultimaTentativaWiFi = agora;

  Serial.println();
  Serial.println("Wi-Fi desconectado.");
  Serial.println("Tentando reconectar...");

  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}


// ======================================================
// SINCRONIZAR RTC COM INTERNET
// ======================================================

bool sincronizarRTCComInternet() {

  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }

  Serial.println("Sincronizando horario pela internet...");

  configTime(
    gmtOffset_sec,
    daylightOffset_sec,
    ntpServer1,
    ntpServer2
  );

  struct tm timeinfo;

  if (!getLocalTime(&timeinfo, 10000)) {

    Serial.println("Falha ao obter horario NTP.");

    return false;
  }

  rtc.adjust(
    DateTime(
      timeinfo.tm_year + 1900,
      timeinfo.tm_mon + 1,
      timeinfo.tm_mday,
      timeinfo.tm_hour,
      timeinfo.tm_min,
      timeinfo.tm_sec
    )
  );

  Serial.println("RTC sincronizado!");

  return true;
}


// ======================================================
// ENVIAR MEDICAO PARA API
// ======================================================

bool enviarMedicao(
  String medicaoId,
  String dataHora,
  float vazao,
  float volumeLitros
) {

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println("Sem Wi-Fi. Medicao nao enviada.");

    return false;
  }

  HTTPClient http;

  http.begin(servidor);

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  String json = "{";

  json += "\"medicaoId\":\"";
  json += medicaoId;
  json += "\",";

  json += "\"dataHora\":\"";
  json += dataHora;
  json += "\",";

  json += "\"vazao\":";
  json += String(vazao, 3);
  json += ",";

  json += "\"volumeLitros\":";
  json += String(volumeLitros, 3);

  json += "}";

  Serial.println();
  Serial.println("Enviando para API:");
  Serial.println(json);

  int codigoHttp = http.POST(json);

  if (codigoHttp > 0) {

    Serial.print("HTTP: ");
    Serial.println(codigoHttp);

    String resposta = http.getString();

    Serial.println("Resposta:");
    Serial.println(resposta);

  } else {

    Serial.print("Erro HTTP: ");
    Serial.println(codigoHttp);
  }

  http.end();

  return (
    codigoHttp >= 200 &&
    codigoHttp < 300
  );
}


// ======================================================
// SALVAR MEDICAO PENDENTE
// ======================================================

bool salvarMedicaoPendente(
  String medicaoId,
  String dataHora,
  float vazao,
  float volumeLitros
) {

  File arquivo =
    SD.open("/pendentes.csv", FILE_APPEND);

  if (!arquivo) {

    Serial.println(
      "Erro ao abrir pendentes.csv!"
    );

    return false;
  }

  // Formato:
  // medicaoId,dataHora,vazao,volumeLitros

  arquivo.print(medicaoId);
  arquivo.print(",");

  arquivo.print(dataHora);
  arquivo.print(",");

  arquivo.print(vazao, 3);
  arquivo.print(",");

  arquivo.println(volumeLitros, 3);

  arquivo.close();

  Serial.println(
    "Medicao salva no microSD como pendente!"
  );

  return true;
}


// ======================================================
// SINCRONIZAR PENDENCIAS
// ======================================================

void sincronizarPendencias() {

  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  if (!SD.exists("/pendentes.csv")) {
    return;
  }

  File arquivo =
    SD.open("/pendentes.csv", FILE_READ);

  if (!arquivo) {

    Serial.println(
      "Erro ao abrir pendentes.csv."
    );

    return;
  }

  if (SD.exists("/temp.csv")) {
    SD.remove("/temp.csv");
  }

  File temporario =
    SD.open("/temp.csv", FILE_WRITE);

  if (!temporario) {

    Serial.println(
      "Erro ao criar temp.csv."
    );

    arquivo.close();

    return;
  }

  Serial.println();
  Serial.println(
    "Sincronizando medicoes pendentes..."
  );

  int enviadas = 0;
  int mantidas = 0;

  while (arquivo.available()) {

    String linha =
      arquivo.readStringUntil('\n');

    linha.trim();

    if (linha.length() == 0) {
      continue;
    }

    int virgula1 =
      linha.indexOf(',');

    int virgula2 =
      linha.indexOf(',', virgula1 + 1);

    int virgula3 =
      linha.indexOf(',', virgula2 + 1);

    if (
      virgula1 == -1 ||
      virgula2 == -1 ||
      virgula3 == -1
    ) {

      Serial.println(
        "Linha invalida encontrada no SD."
      );

      temporario.println(linha);
      mantidas++;

      continue;
    }

    String medicaoId =
      linha.substring(
        0,
        virgula1
      );

    String dataHora =
      linha.substring(
        virgula1 + 1,
        virgula2
      );

    float vazao =
      linha.substring(
        virgula2 + 1,
        virgula3
      ).toFloat();

    float volumeLitros =
      linha.substring(
        virgula3 + 1
      ).toFloat();

    bool sucesso =
      enviarMedicao(
        medicaoId,
        dataHora,
        vazao,
        volumeLitros
      );

    if (sucesso) {

      enviadas++;

    } else {

      temporario.println(linha);
      mantidas++;

      if (WiFi.status() != WL_CONNECTED) {

        while (arquivo.available()) {

          String restante =
            arquivo.readStringUntil('\n');

          restante.trim();

          if (restante.length() > 0) {

            temporario.println(restante);
            mantidas++;
          }
        }

        break;
      }
    }

    delay(200);
  }

  arquivo.close();
  temporario.close();

  SD.remove("/pendentes.csv");

  if (mantidas > 0) {

    SD.rename(
      "/temp.csv",
      "/pendentes.csv"
    );

  } else {

    SD.remove("/temp.csv");
  }

  Serial.println();

  Serial.print("Pendencias enviadas: ");
  Serial.println(enviadas);

  Serial.print("Pendencias restantes: ");
  Serial.println(mantidas);

  Serial.println(
    "Sincronizacao finalizada."
  );

  Serial.println();
}


// ======================================================
// SETUP
// ======================================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  // =========================
  // RTC
  // =========================

  Wire.begin(21, 22);

  if (!rtc.begin()) {

    Serial.println(
      "Erro ao iniciar RTC!"
    );

    while (1);
  }

  Serial.println("RTC iniciado!");

  // =========================
  // MICROSD
  // =========================

  SPI.begin(
    18,
    19,
    23,
    SD_CS
  );

  if (!SD.begin(SD_CS)) {

    Serial.println(
      "Erro ao iniciar microSD!"
    );

    while (1);
  }

  Serial.println(
    "microSD iniciado!"
  );

  // =========================
  // WI-FI
  // =========================

  conectarWiFi();

  // =========================
  // NTP
  // =========================

  if (
    WiFi.status() ==
    WL_CONNECTED
  ) {

    sincronizarRTCComInternet();

    sincronizarPendencias();
  }
}


// ======================================================
// LOOP
// ======================================================

void loop() {

  verificarWiFi();

  DateTime agora = rtc.now();

  // Valores ficticios enquanto
  // o sensor de vazao nao esta conectado
  float vazao = 2.500;
  float volumeLitros = 1.250;

  String medicaoId =
    gerarMedicaoId(agora);

  String dataHora =
    formatarDataHora(agora);

  // Primeiro sincroniza dados antigos
  if (
    WiFi.status() ==
    WL_CONNECTED
  ) {

    sincronizarPendencias();
  }

  // Depois envia a medicao atual
  bool enviado =
    enviarMedicao(
      medicaoId,
      dataHora,
      vazao,
      volumeLitros
    );

  if (enviado) {

    Serial.println(
      "Medicao enviada com sucesso."
    );

  } else {

    Serial.println(
      "Nao foi possivel enviar."
    );

    salvarMedicaoPendente(
      medicaoId,
      dataHora,
      vazao,
      volumeLitros
    );
  }

  Serial.println(
    "----------------------------"
  );

  delay(10000);
}