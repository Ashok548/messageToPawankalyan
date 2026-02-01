import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class VisitorStats {
    @Field(() => ID)
    id: string;

    @Field(() => Int)
    totalVisitors: number;

    @Field()
    updatedAt: Date;
}
