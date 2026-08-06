package com.carbontracker.service.ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class Translator {

    private static MessageSource messageSource;

    @Autowired
    public Translator(MessageSource messageSource) {
        Translator.messageSource = messageSource;
    }

    public static String toLocale(String msgKey, Object... args) {
        if (msgKey == null) {
            return null;
        }
        
        // Clean key: convert "Email is already registered" -> "email.is.already.registered"
        String propertyKey = msgKey.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", ".");

        try {
            Locale locale = LocaleContextHolder.getLocale();
            // Resolve message from bundle. If not found, it falls back to msgKey itself
            return messageSource.getMessage(propertyKey, args, msgKey, locale);
        } catch (Exception e) {
            return msgKey;
        }
    }
}
