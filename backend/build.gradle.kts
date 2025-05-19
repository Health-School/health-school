plugins {
	java
	id("org.springframework.boot") version "3.4.5"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.malnutrition.health_school"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
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

	implementation("software.amazon.awssdk:url-connection-client")
	implementation("org.springframework.boot:spring-boot-starter-webflux") // webClient
	implementation ("net.nurigo:sdk:4.3.0") // 최신버전은 coolsms docs 참고
	implementation(platform("software.amazon.awssdk:bom:2.25.20")) // BOM 관리
	implementation("software.amazon.awssdk:s3") // S3 클라이언트
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation ("org.springframework.boot:spring-boot-starter-mail") // email service
	implementation ("org.springframework.boot:spring-boot-starter-data-redis") // redis
	implementation ("org.springframework.data:spring-data-redis") //redis
	implementation ("io.jsonwebtoken:jjwt-api:0.12.6")
	implementation ("io.jsonwebtoken:jjwt-impl:0.12.6")
	implementation ("io.jsonwebtoken:jjwt-jackson:0.12.6")
	implementation ("org.springframework.boot:spring-boot-starter-security") //security
	implementation("org.springframework.boot:spring-boot-starter-actuator") // actuator , health check
	implementation("org.springframework.boot:spring-boot-starter-validation") // 유효성 검사
	implementation("org.springframework.boot:spring-boot-starter-oauth2-client") // oauth2
	implementation ("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.5") //sweager
	//WebSocket
	implementation ("org.webjars:webjars-locator-core")
	implementation ("org.webjars:sockjs-client:1.5.1")
	implementation ("org.webjars:stomp-websocket:2.3.3")
	implementation ("org.springframework.boot:spring-boot-starter-websocket")
	compileOnly("org.projectlombok:lombok")
	runtimeOnly("com.mysql:mysql-connector-j")
	annotationProcessor("org.projectlombok:lombok")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
