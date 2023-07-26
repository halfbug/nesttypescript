import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  GqlExecutionContext,
} from '@nestjs/graphql';
import { CreateSignUpInput } from './dto/create-signup.input';
import { SignUp, KlaviyoList } from './entities/kalavio.entity';
import { KalavioService } from './kalavio.service';
import { Public } from 'src/auth/public.decorator';

@Resolver(SignUp)
export class KalavioResolver {
  constructor(private readonly kalavioService: KalavioService) {}

  @Public()
  @Mutation(() => SignUp)
  createSignUp(
    @Args('createSignUpInput') createSignUpInput: CreateSignUpInput,
  ) {
    console.log(
      '🚀 ~ file: kalavio.resolver.ts ~ line 15 ~ KalavioResolver ~ createSignUpInput',
      createSignUpInput,
    );
    return this.kalavioService.klaviyoSignUp(createSignUpInput);
  }

  @Query(() => KlaviyoList, { name: 'findKlaviyoList' })
  async findKlaviyoList(
    @Args('storeId') storeId: string,
    @Args('privateKey') privateKey: string,
  ) {
    console.log('storeId', storeId);
    if (storeId !== '') {
      const data = await this.kalavioService.findKlaviyoList(
        storeId,
        privateKey,
      );
      return data;
    }
  }
}
