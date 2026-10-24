from datetime import date, datetime
from statistics import mean, median, quantiles
from typing import List

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from datetime import timedelta

from sklearn.linear_model import LinearRegression

app = FastAPI(
    title="IA - Monitoramento de Água",
    description=(
        "API de análise histórica do consumo de água "
        "para o sistema residencial integrado a IoT."
    ),
    version="1.3.0",
)


# Parâmetros experimentais para detecção de possíveis vazamentos.
# Devem ser validados com o sensor físico.
LIMIAR_VAZAO_L_MIN = 1.0
DURACAO_MINIMA_SEGUNDOS = 300
INTERVALO_MAXIMO_SEGUNDOS = 20


# Tratamento de erros de validação
@app.exception_handler(RequestValidationError)
async def tratar_erro_validacao(
    request: Request,
    exc: RequestValidationError,
):
    corpo = await request.body()

    print("CAMINHO:", request.url.path)
    print("CONTENT-TYPE:", request.headers.get("content-type"))
    print("CORPO RECEBIDO:", repr(corpo[:1000]))
    print("ERROS:", exc.errors())

    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


# Uma medição individual
class Medicao(BaseModel):
    vazao: float = Field(
        ge=0,
        description="Vazão em litros por minuto",
    )
    volume_litros: float = Field(
        ge=0,
        description="Volume da medição em litros",
    )


# Consumo total de um dia
class ConsumoDiario(BaseModel):
    data: date
    volume_litros: float = Field(ge=0)

    primeira_medicao: datetime | None = None
    ultima_medicao: datetime | None = None
    duracao_minutos: int | None = Field(default=None, ge=0)
    quantidade_medicoes: int | None = Field(default=None, ge=0)
    tempo_monitorado_segundos: int | None = Field(default=None, ge=0)


# Histórico diário enviado pelo backend
class HistoricoConsumo(BaseModel):
    consumos: List[ConsumoDiario] = Field(
        min_length=1,
        description="Lista de consumos diários",
    )


# Uma leitura de vazão com data e hora
class LeituraVazao(BaseModel):
    data_hora: datetime
    vazao: float = Field(
        ge=0,
        description="Vazão em litros por minuto",
    )


# Conjunto de leituras recentes para análise de persistência
class HistoricoVazao(BaseModel):
    leituras: List[LeituraVazao] = Field(
        min_length=1,
        description="Leituras de vazão em ordem temporal ou fora de ordem",
    )


# Uma medição com data, hora, vazão e volume.
class LeituraSessao(BaseModel):
    data_hora: datetime

    vazao: float = Field(ge=0)

    volume_litros: float = Field(ge=0)


# Histórico utilizado para identificar sessões de consumo.
class HistoricoSessoes(BaseModel):
    leituras: List[LeituraSessao] = Field(
        min_length=1, description="Medições registradas pelo ESP32"
    )


@app.get("/")
def inicio():
    return {
        "mensagem": "Serviço de IA do Monitoramento de Água funcionando!",
        "status": "online",
        "versao": app.version,
    }


@app.get("/saude")
def verificar_saude():
    return {
        "status": "ok",
        "servico": "ia",
        "data_hora": datetime.now().isoformat(),
    }


# Análise inicial de uma medição individual
@app.post("/analisar")
def analisar_consumo(medicao: Medicao):
    vazao = medicao.vazao
    volume = medicao.volume_litros

    if vazao >= 20:
        alerta = (
            "Vazão muito elevada. Verifique se o consumo "
            "é esperado para essa situação."
        )
    elif vazao >= 10:
        alerta = "Vazão elevada. Acompanhe o consumo."
    else:
        alerta = "Nenhum alerta de vazão pelos limites iniciais."

    return {
        "vazao_litros_minuto": vazao,
        "volume_litros": volume,
        "alerta": alerta,
        "tipo_analise": "regras iniciais",
    }


# Análise estatística do histórico de consumo diário
@app.post("/analisar/historico")
def analisar_historico(historico: HistoricoConsumo):
    # Ordena os registros por data.
    consumos_ordenados = sorted(
        historico.consumos,
        key=lambda item: item.data,
    )

    # Agrupa registros repetidos da mesma data.
    consumo_por_data = {}

    for item in consumos_ordenados:
        consumo_por_data[item.data] = (
            consumo_por_data.get(item.data, 0.0) + item.volume_litros
        )

    consumos_diarios = [
        {
            "data": data,
            "volume_litros": volume,
        }
        for data, volume in sorted(consumo_por_data.items())
    ]

    volumes = [item["volume_litros"] for item in consumos_diarios]

    quantidade = len(volumes)
    total_litros = sum(volumes)
    media_diaria = mean(volumes)
    mediana_diaria = median(volumes)

    maior_consumo = max(
        consumos_diarios,
        key=lambda item: item["volume_litros"],
    )

    # Com quatro ou mais dias, utiliza o intervalo interquartil (IQR).
    if quantidade >= 4:
        quartis = quantiles(volumes, n=4, method="inclusive")
        primeiro_quartil = quartis[0]
        terceiro_quartil = quartis[2]

        intervalo_interquartil = terceiro_quartil - primeiro_quartil

        limite_atipico = terceiro_quartil + 1.5 * intervalo_interquartil

        metodo = (
            "detecção estatística de valores atípicos "
            "pelo intervalo interquartil (IQR)"
        )
    else:
        primeiro_quartil = None
        terceiro_quartil = None
        intervalo_interquartil = None
        limite_atipico = mediana_diaria * 1.5

        metodo = (
            "regra exploratória de 1,5 vez a mediana, "
            "devido à quantidade reduzida de dias"
        )

    dias_atipicos = []

    for item in consumos_diarios:
        volume = item["volume_litros"]

        if volume > limite_atipico:
            if mediana_diaria > 0:
                diferenca_percentual = (
                    (volume - mediana_diaria) / mediana_diaria
                ) * 100
            else:
                diferenca_percentual = None

            limite_alto = (
                limite_atipico + 1.5 * intervalo_interquartil
                if quantidade >= 4
                else limite_atipico * 1.5
            )

            nivel_atencao = "alto" if volume > limite_alto else "moderado"

            dias_atipicos.append(
                {
                    "data": item["data"].isoformat(),
                    "volume_litros": round(volume, 3),
                    "mediana_litros": round(mediana_diaria, 3),
                    "diferenca_percentual_mediana": (
                        round(diferenca_percentual, 2)
                        if diferenca_percentual is not None
                        else None
                    ),
                    "nivel_atencao": nivel_atencao,
                    "motivo": (
                        "O consumo diário ficou acima do limite "
                        "estatístico calculado para o histórico."
                    ),
                }
            )

    return {
        "quantidade_dias": quantidade,
        "periodo": {
            "inicio": consumos_diarios[0]["data"].isoformat(),
            "fim": consumos_diarios[-1]["data"].isoformat(),
        },
        "consumo_total_litros": round(total_litros, 3),
        "media_diaria_litros": round(media_diaria, 3),
        "mediana_diaria_litros": round(mediana_diaria, 3),
        "maior_consumo": {
            "data": maior_consumo["data"].isoformat(),
            "volume_litros": round(maior_consumo["volume_litros"], 3),
        },
        "limite_atipico_litros": round(limite_atipico, 3),
        "primeiro_quartil_litros": (
            round(primeiro_quartil, 3) if primeiro_quartil is not None else None
        ),
        "terceiro_quartil_litros": (
            round(terceiro_quartil, 3) if terceiro_quartil is not None else None
        ),
        "intervalo_interquartil_litros": (
            round(intervalo_interquartil, 3)
            if intervalo_interquartil is not None
            else None
        ),
        "dias_com_consumo_atipico": dias_atipicos,
        "metodo": metodo,
        "observacao": (
            "Os valores atípicos indicam consumos que merecem "
            "investigação, mas não confirmam vazamento. A análise "
            "depende da qualidade e da representatividade do histórico. "
            "O IQR é um critério estatístico exploratório, não um "
            "modelo de aprendizado de máquina."
        ),
        "dias_com_consumo_atipico": dias_atipicos,
        "metodo": metodo,
        "observacao": (
            "Os valores atípicos indicam consumos que merecem "
            "investigação, mas não confirmam vazamento. A análise "
            "depende da qualidade e da representatividade do histórico. "
            "O IQR é um critério estatístico exploratório, não um "
            "modelo de aprendizado de máquina."
        ),
    }


# Análise experimental de possível vazamento pela persistência da vazão
@app.post("/analisar/vazamento")
def analisar_vazamento(historico: HistoricoVazao):
    leituras = sorted(
        historico.leituras,
        key=lambda item: item.data_hora,
    )

    # Identifica sequências contínuas de leituras acima do limiar.
    sequencias = []
    sequencia_atual = []

    for leitura in leituras:
        acima_do_limiar = leitura.vazao >= LIMIAR_VAZAO_L_MIN

        if not acima_do_limiar:
            if sequencia_atual:
                sequencias.append(sequencia_atual)
                sequencia_atual = []
            continue

        if sequencia_atual:
            anterior = sequencia_atual[-1]
            intervalo = (leitura.data_hora - anterior.data_hora).total_seconds()

            # Um intervalo grande quebra a sequência.
            if intervalo <= 0 or intervalo > INTERVALO_MAXIMO_SEGUNDOS:
                sequencias.append(sequencia_atual)
                sequencia_atual = []

        sequencia_atual.append(leitura)

    if sequencia_atual:
        sequencias.append(sequencia_atual)

    # Seleciona a sequência com maior duração observada.
    melhor_sequencia = max(
        sequencias,
        key=lambda seq: (
            (seq[-1].data_hora - seq[0].data_hora).total_seconds()
            if len(seq) >= 2
            else 0
        ),
        default=[],
    )

    if len(melhor_sequencia) >= 2:
        duracao_segundos = (
            melhor_sequencia[-1].data_hora - melhor_sequencia[0].data_hora
        ).total_seconds()
    else:
        duracao_segundos = 0

    vazao_media = (
        mean(leitura.vazao for leitura in melhor_sequencia) if melhor_sequencia else 0
    )

    possivel_vazamento = duracao_segundos >= DURACAO_MINIMA_SEGUNDOS

    if possivel_vazamento:
        alerta = (
            "Possível vazamento: foi detectada vazão persistente "
            "acima do limiar experimental. Verifique a situação."
        )
        status = "possivel_vazamento"
    else:
        alerta = (
            "Não foi identificada persistência suficiente para "
            "gerar alerta com os parâmetros atuais."
        )
        status = "sem_alerta_de_persistencia"

    return {
        "quantidade_leituras_analisadas": len(leituras),
        "possivel_vazamento": possivel_vazamento,
        "status": status,
        "alerta": alerta,
        "tipo_analise": "regra experimental de persistência da vazão",
        "parametros": {
            "limiar_vazao_litros_minuto": LIMIAR_VAZAO_L_MIN,
            "duracao_minima_segundos": DURACAO_MINIMA_SEGUNDOS,
            "intervalo_maximo_entre_leituras_segundos": (INTERVALO_MAXIMO_SEGUNDOS),
        },
        "sequencia_analisada": {
            "quantidade_leituras": len(melhor_sequencia),
            "inicio": (
                melhor_sequencia[0].data_hora.isoformat() if melhor_sequencia else None
            ),
            "fim": (
                melhor_sequencia[-1].data_hora.isoformat() if melhor_sequencia else None
            ),
            "duracao_segundos": round(duracao_segundos, 1),
            "vazao_media_litros_minuto": round(vazao_media, 3),
        },
        "observacao": (
            "Este resultado indica apenas uma possível ocorrência. "
            "Vazão persistente também pode representar uso normal. "
            "O limiar precisa ser validado experimentalmente com o "
            "sensor instalado no protótipo. O sensor pode não medir "
            "com confiabilidade vazões abaixo de sua faixa nominal."
        ),
    }


@app.post("/prever/consumo")
def prever_consumo(historico: HistoricoConsumo):

    # Agrupa volume e informações de monitoramento por data.
    consumos_por_data = {}

    for item in historico.consumos:

        if item.data not in consumos_por_data:
            consumos_por_data[item.data] = {
                "volume_litros": 0.0,
                "tempo_monitorado_segundos": 0,
                "quantidade_medicoes": 0,
                "tempo_informado": False,
            }

        registro = consumos_por_data[item.data]

        registro["volume_litros"] += item.volume_litros

        if item.tempo_monitorado_segundos is not None:
            registro["tempo_monitorado_segundos"] += item.tempo_monitorado_segundos
            registro["tempo_informado"] = True

        if item.quantidade_medicoes is not None:
            registro["quantidade_medicoes"] += item.quantidade_medicoes

    datas = sorted(consumos_por_data.keys())

    # Mantém a exigência de pelo menos 7 dias distintos.
    if len(datas) < 7:
        return {
            "status": "historico_insuficiente",
            "mensagem": (
                "São necessários pelo menos 7 dias distintos "
                "para gerar uma previsão experimental."
            ),
            "quantidade_dias_historicos": len(datas),
            "quantidade_minima_dias": 7,
        }

    # Monta um diagnóstico da cobertura de monitoramento.
    cobertura_diaria = []

    for data in datas:

        registro = consumos_por_data[data]
        segundos = registro["tempo_monitorado_segundos"]

        horas = segundos / 3600

        percentual_dia = min(100.0, (segundos / 86400) * 100)

        cobertura_diaria.append(
            {
                "data": data.isoformat(),
                "volume_litros": round(registro["volume_litros"], 3),
                "tempo_monitorado_segundos": segundos,
                "horas_monitoradas": round(horas, 3),
                "percentual_dia_monitorado": round(percentual_dia, 2),
                "quantidade_medicoes": registro["quantidade_medicoes"],
                "tempo_monitorado_informado": registro["tempo_informado"],
            }
        )

    # Verifica se há dias com monitoramento limitado.
    dias_monitoramento_curto = [
        item["data"]
        for item in cobertura_diaria
        if (item["tempo_monitorado_informado"] and item["horas_monitoradas"] < 1)
    ]

    dias_sem_tempo_informado = [
        item["data"]
        for item in cobertura_diaria
        if not item["tempo_monitorado_informado"]
    ]

    # Mantém a regressão sobre volumes realmente medidos.
    # Não extrapola automaticamente sessões curtas para 24h.
    data_inicial = datas[0]

    X = [[(data_atual - data_inicial).days] for data_atual in datas]

    y = [consumos_por_data[data]["volume_litros"] for data in datas]

    modelo = LinearRegression()
    modelo.fit(X, y)

    previsoes = []

    for dias_futuros in range(1, 8):

        data_prevista = datas[-1] + timedelta(days=dias_futuros)

        indice_temporal = (data_prevista - data_inicial).days

        volume_previsto = float(modelo.predict([[indice_temporal]])[0])

        volume_previsto = max(0.0, volume_previsto)

        previsoes.append(
            {
                "data": data_prevista.isoformat(),
                "volume_previsto_litros": round(volume_previsto, 3),
            }
        )

    # Classifica a qualidade da cobertura,
    # sem tratar essa classificação como precisão do modelo.
    if dias_sem_tempo_informado:
        qualidade_cobertura = "indeterminada"
    elif dias_monitoramento_curto:
        qualidade_cobertura = "limitada"
    else:
        qualidade_cobertura = "nao_validada"

    return {
        "status": "sucesso",
        "tipo_modelo": "regressão linear",
        "quantidade_dias_historicos": len(datas),
        "periodo_historico": {
            "inicio": datas[0].isoformat(),
            "fim": datas[-1].isoformat(),
        },
        "periodo_previsao": {
            "inicio": previsoes[0]["data"],
            "fim": previsoes[-1]["data"],
        },
        "previsoes": previsoes,
        "monitoramento": {
            "qualidade_cobertura": qualidade_cobertura,
            "quantidade_dias_monitoramento_curto": len(dias_monitoramento_curto),
            "dias_monitoramento_curto": (dias_monitoramento_curto),
            "dias_sem_tempo_informado": (dias_sem_tempo_informado),
            "cobertura_diaria": cobertura_diaria,
        },
        "observacao": (
            "Previsão experimental por regressão linear "
            "baseada nos volumes registrados em cada data. "
            "A cobertura de monitoramento é apresentada "
            "como diagnóstico, mas ainda não é utilizada "
            "como variável de treinamento. "
            "Sessões curtas não representam necessariamente "
            "o consumo de um dia residencial completo. "
            "O modelo ainda precisa ser avaliado com "
            "dados representativos e validação temporal."
        ),
    }


# Identificação automática de sessões de consumo.
@app.post("/analisar/sessoes")
def analisar_sessoes(historico: HistoricoSessoes):

    LIMIAR_CONSUMO = 0.0
    INTERVALO_ESPERADO = 20
    INTERVALO_MAXIMO = 60

    leituras = sorted(historico.leituras, key=lambda item: item.data_hora)

    sessoes = []
    sessao_atual = []
    interrupcoes = []

    def finalizar_sessao(leituras_sessao, motivo):

        if not leituras_sessao:
            return

        inicio = leituras_sessao[0].data_hora
        fim = leituras_sessao[-1].data_hora

        duracao = (fim - inicio).total_seconds()

        volume_total = sum(leitura.volume_litros for leitura in leituras_sessao)

        vazao_media = mean(leitura.vazao for leitura in leituras_sessao)

        sessoes.append(
            {
                "numero": len(sessoes) + 1,
                "inicio": inicio.isoformat(),
                "fim": fim.isoformat(),
                "duracao_segundos": round(duracao, 1),
                "volume_litros": round(volume_total, 3),
                "vazao_media_litros_minuto": round(vazao_media, 3),
                "quantidade_medicoes": len(leituras_sessao),
                "motivo_encerramento": motivo,
            }
        )

    for leitura in leituras:

        consumo_ativo = leitura.vazao > LIMIAR_CONSUMO

        # Vazão zero encerra a sessão.
        if not consumo_ativo:

            if sessao_atual:
                finalizar_sessao(sessao_atual, "vazao_zero")
                sessao_atual = []

            continue

        # Verifica intervalo entre leituras positivas.
        if sessao_atual:

            anterior = sessao_atual[-1]

            intervalo = (leitura.data_hora - anterior.data_hora).total_seconds()

            if intervalo > INTERVALO_ESPERADO:

                if intervalo <= INTERVALO_MAXIMO:
                    tipo = "atraso_medicao"
                else:
                    tipo = "continuidade_desconhecida"

                interrupcoes.append(
                    {
                        "ultima_leitura_anterior": anterior.data_hora.isoformat(),
                        "primeira_leitura_seguinte": leitura.data_hora.isoformat(),
                        "intervalo_segundos": intervalo,
                        "tipo": tipo,
                    }
                )

            # Intervalo muito longo: separa os trechos.
            if intervalo > INTERVALO_MAXIMO:

                finalizar_sessao(sessao_atual, "continuidade_desconhecida")

                sessao_atual = []

        # Inicia ou continua a sessão.
        sessao_atual.append(leitura)

    if sessao_atual:

        finalizar_sessao(sessao_atual, "fim_historico")

    volume_total = sum(sessao["volume_litros"] for sessao in sessoes)

    duracao_total = sum(sessao["duracao_segundos"] for sessao in sessoes)

    quantidade_atrasos = sum(
        1 for item in interrupcoes if item["tipo"] == "atraso_medicao"
    )

    quantidade_continuidade_desconhecida = sum(
        1 for item in interrupcoes if item["tipo"] == "continuidade_desconhecida"
    )

    return {
        "status": "sucesso",
        "tipo_analise": "identificacao_sessoes_consumo",
        "quantidade_leituras_analisadas": len(leituras),
        "quantidade_sessoes": len(sessoes),
        "volume_total_litros": round(volume_total, 3),
        "duracao_total_segundos": round(duracao_total, 1),
        "quantidade_interrupcoes": len(interrupcoes),
        "quantidade_atrasos_medicao": quantidade_atrasos,
        "quantidade_continuidade_desconhecida": quantidade_continuidade_desconhecida,
        "interrupcoes": interrupcoes,
        "sessoes": sessoes,
        "observacao": (
            "As sessões foram identificadas por regras "
            "de vazão e continuidade temporal. "
            "Intervalos superiores a 20 segundos e de "
            "até 60 segundos são classificados como "
            "atrasos de medição, sem encerrar a sessão. "
            "Intervalos superiores a 60 segundos "
            "separam trechos cuja continuidade não "
            "pode ser confirmada. Vazão zero encerra "
            "a sessão. A duração corresponde ao "
            "intervalo entre a primeira e a última "
            "leitura positiva, não necessariamente ao "
            "tempo exato de funcionamento da bomba. "
            "Esta análise não utiliza aprendizado "
            "de máquina."
        ),
    }
