import "reflect-metadata";
import { Controller, Get, Module, Render } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { resolve } from "node:path";

@Controller()
class HomeController {
  @Get("/")
  @Render("index")
  home() {
    return { title: "NestJS report" };
  }
}

@Module({ controllers: [HomeController] })
class AppModule {}

async function start() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(resolve("public"));
  app.setBaseViewsDir(resolve("views"));
  app.setViewEngine("hbs");
  await app.listen(Number(process.env.PORT ?? 3000), "127.0.0.1");
}

void start();
