import { Module } from '@nestjs/common'
import { FarmsService } from './farms.service.js'
import { FarmsController } from './farms.controller.js'

@Module({
  providers: [FarmsService],
  controllers: [FarmsController],
})
export class FarmsModule {}
