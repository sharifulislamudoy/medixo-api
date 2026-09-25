import { Module } from "@nestjs/common";
import { AuthController } from "./auth/auth.controller";
import { LegacyController } from "./legacy.controller";
import { AppDataController } from "./app-data.controller";

@Module({ controllers: [AuthController, AppDataController, LegacyController] })
export class AppModule {}
