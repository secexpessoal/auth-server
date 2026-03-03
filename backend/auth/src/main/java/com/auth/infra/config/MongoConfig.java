package com.auth.infra.config;

import com.mongodb.ConnectionString;
import org.bson.UuidRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.mongodb.autoconfigure.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MongoConfig {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Bean
    public MongoClientSettingsBuilderCustomizer customMongoSettings() {
        return builder -> {
            builder.applyConnectionString(new ConnectionString(mongoUri));
            builder.uuidRepresentation(UuidRepresentation.STANDARD);
        };
    }
}
