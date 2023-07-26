import { Scalar, CustomScalar } from '@nestjs/graphql';

@Scalar('Any')
export class AnyScalar implements CustomScalar<any, any> {
  description = 'anything ';

  parseValue(value: any): any {
    return value; // value from the client
  }

  serialize(value: any): any {
    return value; // value sent to the client
  }

  parseLiteral(ast: any): any {
    return ast.value;
  }
}
