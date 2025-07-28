package com.moujib.lookmax_backend.services.implementations;

import com.moujib.lookmax_backend.services.MainService;
import org.springframework.stereotype.Service;

@Service
public class MainServiceImpl implements MainService {

    @Override
    public void doSomething(String something) {
        System.out.println(something);
    }
}
