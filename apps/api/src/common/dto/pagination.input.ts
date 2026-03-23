import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

@InputType()
export class PaginationInput {
    @Field(() => Int, { nullable: true, defaultValue: 20, description: 'Number of records to return' })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    take?: number = 20;

    @Field(() => Int, { nullable: true, defaultValue: 0, description: 'Number of records to skip' })
    @IsOptional()
    @IsInt()
    @Min(0)
    skip?: number = 0;
}
