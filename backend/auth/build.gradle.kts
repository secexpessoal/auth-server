group = "gov.tcm"
version = "0.0.1-SNAPSHOT"
description = "App de aposentadoria SIAAP feito pela SAP."

plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

java {
    sourceCompatibility = JavaVersion.VERSION_25
    targetCompatibility = JavaVersion.VERSION_25
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Web & Core
    implementation(libs.spring.boot.starter.webmvc)
    implementation(libs.spring.boot.starter.validation)
    implementation(libs.spring.boot.starter.restclient)
    implementation(libs.spring.boot.starter.actuator)
    developmentOnly(libs.spring.boot.devtools)
    
    // Security
    implementation(libs.spring.boot.starter.security)
    implementation(libs.jjwt.api)
    runtimeOnly(libs.jjwt.impl)
    runtimeOnly(libs.jjwt.jackson)
    implementation(libs.bucket4j.core)
    
    // Database & Persistence
    implementation(libs.spring.boot.starter.data.jpa)
    implementation(libs.spring.boot.starter.flyway)
    implementation(libs.flyway.database.postgresql)
    runtimeOnly(libs.postgresql)
    runtimeOnly(libs.h2)
    implementation(libs.spring.boot.h2console)
    
    // Documentation
    implementation(libs.springdoc.openapi)
    
    // Utils
    compileOnly(libs.lombok)
    annotationProcessor(libs.lombok)
    
    // Testing
    testImplementation(libs.spring.boot.starter.test)
    testImplementation(libs.spring.boot.test.autoconfigure)
    testImplementation(libs.spring.boot.starter.data.jpa) // Adicionado para DataJpaTest
    testImplementation(libs.spring.boot.starter.security.test)
    testImplementation(libs.testcontainers.postgresql)
    testImplementation(libs.testcontainers.junit.jupiter)
}

tasks.withType<Test> {
    useJUnitPlatform()
}
