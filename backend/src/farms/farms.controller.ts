import { Controller, Get } from '@nestjs/common'
import { FarmsService } from './farms.service.js'

@Controller('api/farms')
export class FarmsController {
  constructor(private farmsService: FarmsService) {}

  @Get()
  getAllFarms() {
    return this.farmsService.getAllFarms()
  }
}
