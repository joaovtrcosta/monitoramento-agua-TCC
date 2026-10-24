package com.tcc.backend.service;

import com.tcc.backend.entity.Medicao;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.net.http.HttpClient;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.time.Duration;

@Service
public class AnaliseIaService {

        private final MedicaoService medicaoService;
        private final RestClient restClient;

        public AnaliseIaService(MedicaoService medicaoService) {
                this.medicaoService = medicaoService;

                this.restClient = RestClient.builder()
                                .baseUrl("http://127.0.0.1:8000")
                                .requestFactory(
                                                new JdkClientHttpRequestFactory(
                                                                HttpClient.newBuilder()
                                                                                .version(HttpClient.Version.HTTP_1_1)
                                                                                .build()))
                                .build();
        }

        public Map<String, Object> analisarHistorico(String email) {

                // Busca as medições reais do usuário no banco de dados
                List<Medicao> medicoes = medicaoService.listarMedicoesReais(email);

                if (medicoes.isEmpty()) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Não existem medições para analisar.");
                }

                // Agrupa o consumo por dia
                Map<LocalDate, BigDecimal> consumoPorDia = new TreeMap<>();

                for (Medicao medicao : medicoes) {
                        LocalDate data = medicao.getDataHora().toLocalDate();

                        consumoPorDia.merge(
                                        data,
                                        medicao.getVolumeLitros(),
                                        BigDecimal::add);
                }

                // Prepara os dados no formato esperado pelo Python
                List<Map<String, Object>> consumos = new ArrayList<>();

                consumoPorDia.forEach((data, volume) -> {
                        Map<String, Object> consumo = new LinkedHashMap<>();

                        consumo.put("data", data.toString());
                        consumo.put("volume_litros", volume);

                        consumos.add(consumo);
                });

                // Monta a requisição com os dados reais
                Map<String, Object> requisicao = Map.of(
                                "consumos", consumos);

                try {
                        // Envia o histórico real para o FastAPI
                        Map<String, Object> resposta = restClient.post()
                                        .uri("/analisar/historico")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(requisicao)
                                        .retrieve()
                                        .body(new ParameterizedTypeReference<Map<String, Object>>() {
                                        });

                        System.out.println("Resposta recebida do Python:");
                        System.out.println(resposta);

                        if (resposta == null) {
                                throw new ResponseStatusException(
                                                HttpStatus.BAD_GATEWAY,
                                                "A API Python não retornou resultados.");
                        }

                        return resposta;

                } catch (RestClientException e) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_GATEWAY,
                                        "Falha ao chamar a API Python: " + e.getMessage(),
                                        e);
                }

        }

        public Map<String, Object> analisarVazamento(String email) {
                LocalDateTime agora = LocalDateTime.now();
                LocalDateTime inicio = agora.minusMinutes(6);

                List<Medicao> medicoes = medicaoService
                                .listarMedicoesRecentes(email, inicio)
                                .stream()
                                .filter(m -> "REAL".equals(m.getOrigem()))
                                .filter(m -> m.getDataHora() != null)
                                .filter(m -> !m.getDataHora().isAfter(agora))
                                .sorted(Comparator.comparing(Medicao::getDataHora))
                                .toList();
                System.out.println("E-mail autenticado: " + email);
                System.out.println("Início da busca: " + inicio);
                System.out.println("Agora no Spring: " + agora);
                System.out.println("Medições encontradas: " + medicoes.size());

                medicoes.forEach(m -> System.out.println(
                                m.getDataHora() + " | vazão: " + m.getVazao()));

                if (medicoes.isEmpty()) {
                        Map<String, Object> resultado = new LinkedHashMap<>();
                        resultado.put("possivel_vazamento", false);
                        resultado.put("status", "sem_dados_recentes");
                        resultado.put("alerta",
                                        "Não existem medições recentes para analisar.");
                        resultado.put("observacao",
                                        "A análise depende de leituras recentes do sensor.");
                        return resultado;
                }

                List<Map<String, Object>> leituras = new ArrayList<>();

                for (Medicao medicao : medicoes) {
                        Map<String, Object> leitura = new LinkedHashMap<>();
                        leitura.put("data_hora", medicao.getDataHora().toString());
                        leitura.put("vazao", medicao.getVazao());
                        leituras.add(leitura);
                }

                Map<String, Object> requisicao = Map.of("leituras", leituras);

                try {
                        Map<String, Object> resposta = restClient.post()
                                        .uri("/analisar/vazamento")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(requisicao)
                                        .retrieve()
                                        .body(new ParameterizedTypeReference<Map<String, Object>>() {
                                        });

                        if (resposta == null) {
                                throw new ResponseStatusException(
                                                HttpStatus.BAD_GATEWAY,
                                                "A API Python não retornou resultados para a análise de vazamento.");
                        }

                        System.out.println("Resultado da análise de possível vazamento:");
                        System.out.println(resposta);

                        return resposta;

                } catch (RestClientException e) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_GATEWAY,
                                        "Falha ao chamar a API Python para analisar possível vazamento: "
                                                        + e.getMessage(),
                                        e);
                }
        }

        public Map<String, Object> preverConsumo(String email) {

                // Busca somente as medições reais do usuário autenticado.
                List<Medicao> medicoes = medicaoService.listarMedicoesReais(email);

                if (medicoes.isEmpty()) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Não existem medições para prever o consumo.");
                }

                // Agrupa as informações por dia.
                Map<LocalDate, BigDecimal> consumoPorDia = new TreeMap<>();
                Map<LocalDate, LocalDateTime> primeiraMedicaoPorDia = new TreeMap<>();
                Map<LocalDate, LocalDateTime> ultimaMedicaoPorDia = new TreeMap<>();
                Map<LocalDate, Integer> quantidadeMedicoesPorDia = new TreeMap<>();
                Map<LocalDate, List<Medicao>> medicoesPorDia = new TreeMap<>();

                for (Medicao medicao : medicoes) {

                        if (medicao.getDataHora() == null
                                        || medicao.getVolumeLitros() == null) {
                                continue;
                        }

                        LocalDateTime dataHora = medicao.getDataHora();
                        LocalDate data = dataHora.toLocalDate();

                        // Soma o volume consumido no dia.
                        consumoPorDia.merge(
                                        data,
                                        medicao.getVolumeLitros(),
                                        BigDecimal::add);

                        // Registra a primeira medição do dia.
                        primeiraMedicaoPorDia.merge(
                                        data,
                                        dataHora,
                                        (anterior, atual) -> anterior.isBefore(atual) ? anterior : atual);

                        // Registra a última medição do dia.
                        ultimaMedicaoPorDia.merge(
                                        data,
                                        dataHora,
                                        (anterior, atual) -> anterior.isAfter(atual) ? anterior : atual);

                        // Conta quantas medições foram realizadas.
                        quantidadeMedicoesPorDia.merge(
                                        data,
                                        1,
                                        Integer::sum);

                        // Guarda as medições para calcular a continuidade.
                        medicoesPorDia
                                        .computeIfAbsent(data, chave -> new ArrayList<>())
                                        .add(medicao);
                }

                // Mantém a validação existente de pelo menos 7 dias distintos.
                if (consumoPorDia.size() < 7) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "São necessários pelo menos 7 dias distintos "
                                                        + "de histórico para prever o consumo. "
                                                        + "Dias disponíveis: " + consumoPorDia.size());
                }

                // Prepara os dados para enviar ao Python.
                List<Map<String, Object>> consumos = new ArrayList<>();

                consumoPorDia.forEach((data, volume) -> {

                        Map<String, Object> consumo = new LinkedHashMap<>();

                        LocalDateTime primeira = primeiraMedicaoPorDia.get(data);
                        LocalDateTime ultima = ultimaMedicaoPorDia.get(data);

                        // Intervalo entre a primeira e a última medição.
                        long duracaoMinutos = Duration.between(
                                        primeira,
                                        ultima).toMinutes();

                        // Tempo monitorado considerando apenas leituras consecutivas.
                        long tempoMonitoradoSegundos = calcularTempoMonitoradoSegundos(
                                        medicoesPorDia.get(data));

                        consumo.put("data", data.toString());
                        consumo.put("volume_litros", volume);
                        consumo.put("primeira_medicao", primeira.toString());
                        consumo.put("ultima_medicao", ultima.toString());
                        consumo.put("duracao_minutos", duracaoMinutos);
                        consumo.put("quantidade_medicoes", quantidadeMedicoesPorDia.get(data));
                        consumo.put("tempo_monitorado_segundos", tempoMonitoradoSegundos);

                        consumos.add(consumo);
                });

                Map<String, Object> requisicao = Map.of(
                                "consumos", consumos);

                try {

                        Map<String, Object> resposta = restClient.post()
                                        .uri("/prever/consumo")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(requisicao)
                                        .retrieve()
                                        .body(new ParameterizedTypeReference<Map<String, Object>>() {
                                        });

                        if (resposta == null) {
                                throw new ResponseStatusException(
                                                HttpStatus.BAD_GATEWAY,
                                                "A API Python não retornou a previsão de consumo.");
                        }

                        System.out.println("Resultado da previsão de consumo:");
                        System.out.println(resposta);

                        return resposta;

                } catch (RestClientException e) {

                        throw new ResponseStatusException(
                                        HttpStatus.BAD_GATEWAY,
                                        "Falha ao chamar a API Python para prever o consumo: "
                                                        + e.getMessage(),
                                        e);
                }
        }

        private long calcularTempoMonitoradoSegundos(List<Medicao> medicoes) {

                List<Medicao> ordenadas = medicoes.stream()
                                .filter(m -> m.getDataHora() != null)
                                .sorted(Comparator.comparing(Medicao::getDataHora))
                                .toList();

                long totalSegundos = 0;

                // O ESP32 envia medições aproximadamente a cada 10 segundos.
                // Intervalos maiores que 20 segundos são considerados interrupções.
                final long INTERVALO_MAXIMO_SEGUNDOS = 20;

                for (int i = 1; i < ordenadas.size(); i++) {

                        long intervalo = Duration.between(
                                        ordenadas.get(i - 1).getDataHora(),
                                        ordenadas.get(i).getDataHora()).getSeconds();

                        if (intervalo > 0 && intervalo <= INTERVALO_MAXIMO_SEGUNDOS) {
                                totalSegundos += intervalo;
                        }
                }

                return totalSegundos;
        }

        public Map<String, Object> analisarSessoes(String email) {

                // Busca somente as medições reais do usuário autenticado.
                List<Medicao> medicoes = medicaoService
                                .listarMedicoesReais(email)
                                .stream()
                                .filter(m -> m.getDataHora() != null)
                                .filter(m -> m.getVazao() != null)
                                .filter(m -> m.getVolumeLitros() != null)
                                .sorted(Comparator.comparing(Medicao::getDataHora))
                                .toList();

                if (medicoes.isEmpty()) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Não existem medições reais para analisar sessões.");
                }

                // Converte as medições para o formato esperado pelo Python.
                List<Map<String, Object>> leituras = new ArrayList<>();

                for (Medicao medicao : medicoes) {

                        Map<String, Object> leitura = new LinkedHashMap<>();

                        leitura.put(
                                        "data_hora",
                                        medicao.getDataHora().toString());

                        leitura.put(
                                        "vazao",
                                        medicao.getVazao());

                        leitura.put(
                                        "volume_litros",
                                        medicao.getVolumeLitros());

                        leituras.add(leitura);
                }

                Map<String, Object> requisicao = Map.of(
                                "leituras", leituras);

                try {

                        Map<String, Object> resposta = restClient.post()
                                        .uri("/analisar/sessoes")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .body(requisicao)
                                        .retrieve()
                                        .body(
                                                        new ParameterizedTypeReference<Map<String, Object>>() {
                                                        });

                        if (resposta == null) {
                                throw new ResponseStatusException(
                                                HttpStatus.BAD_GATEWAY,
                                                "A API Python não retornou a análise de sessões.");
                        }

                        System.out.println("Resultado da análise de sessões:");
                        System.out.println(resposta);

                        return resposta;

                } catch (RestClientException e) {

                        throw new ResponseStatusException(
                                        HttpStatus.BAD_GATEWAY,
                                        "Falha ao chamar a API Python para analisar sessões: "
                                                        + e.getMessage(),
                                        e);
                }
        }

}
