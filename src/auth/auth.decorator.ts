import { Injectable } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from './auth.service';

export const AuthDecorator = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);

    const req = ctx.getContext().req;
    const auth = req?.auth;
    console.log(auth?.[data]);
    // if (data) {
    //   console.log('🚀 ~ file: auth.decorator.ts ~ line 13 ~ data', data);

    //   return auth?.[data];
    // } else
    if (auth?.[data]) return auth?.[data];
    return auth;
  },
);
