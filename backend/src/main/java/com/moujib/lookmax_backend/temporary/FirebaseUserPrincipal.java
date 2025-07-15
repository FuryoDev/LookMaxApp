package com.moujib.lookmax_backend.temporary;

import lombok.Getter;

import java.security.Principal;

@Getter
public record FirebaseUserPrincipal(String uid, String email, String displayName) implements Principal {
    @Override
    public String getName() {
        return uid;
    }
}
