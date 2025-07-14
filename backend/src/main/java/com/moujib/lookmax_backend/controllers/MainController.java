package com.moujib.lookmax_backend.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @GetMapping("/main")
    public String getMainControllerSomething() {
        return "String chain from the backend";
    }
}
