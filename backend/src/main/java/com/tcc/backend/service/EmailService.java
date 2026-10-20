
package com.tcc.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remetente;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarEmailRecuperacao(
            String destinatario,
            String link) {

        SimpleMailMessage mensagem = new SimpleMailMessage();

        mensagem.setFrom(remetente);
        mensagem.setTo(destinatario);
        mensagem.setSubject("Recuperação de senha");

        mensagem.setText(
                "Olá!\n\n"
                        + "Recebemos uma solicitação para redefinir sua senha.\n\n"
                        + "Clique no link abaixo:\n\n"
                        + link
                        + "\n\nEste link é válido por 15 minutos."
                        + "\n\nSe você não solicitou a recuperação, "
                        + "ignore este e-mail.");

        mailSender.send(mensagem);
    }
}
