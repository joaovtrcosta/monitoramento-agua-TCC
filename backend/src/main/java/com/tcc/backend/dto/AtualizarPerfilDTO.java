package com.tcc.backend.dto;

public class AtualizarPerfilDTO {

    private String nome;
    private String email;

    public AtualizarPerfilDTO() {
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}