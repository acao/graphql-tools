import { GraphQLSchema, DocumentNode } from 'graphql';
import { getIntrospectionQuery, buildClientSchema, parse } from 'graphql';
import { ApolloLink } from 'apollo-link';
import { Fetcher } from '../Interfaces';
import linkToFetcher from './linkToFetcher';

export default async function introspectSchema(
  fetcher: ApolloLink | Fetcher,
  linkContext?: { [key: string]: any },
): Promise<GraphQLSchema> {
  // Convert link to fetcher
  if ((fetcher as ApolloLink).request) {
    fetcher = linkToFetcher(fetcher as ApolloLink);
  }

  const parsedIntrospectionQuery: DocumentNode = parse(getIntrospectionQuery());

  const introspectionResult = await (fetcher as Fetcher)({
    query: parsedIntrospectionQuery,
    context: linkContext,
  });

  if (
    (introspectionResult.errors && introspectionResult.errors.length) ||
    !introspectionResult.data.__schema
  ) {
    throw introspectionResult.errors;
  } else {
    const schema = buildClientSchema(introspectionResult.data as {
      __schema: any;
    });
    return schema;
  }
}
