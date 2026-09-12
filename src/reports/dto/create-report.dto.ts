import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDto {
    @IsString()
    @IsNotEmpty()
    topic!: string;
}
