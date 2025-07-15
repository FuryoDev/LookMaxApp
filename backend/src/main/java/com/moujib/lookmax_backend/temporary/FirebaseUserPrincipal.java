package com.moujib.lookmax_backend.temporary;

import java.security.Principal;

public record FirebaseUserPrincipal(String uid, String email, String displayName) implements Principal {
    @Override
    public String getName() {
        return uid;
    }
}
