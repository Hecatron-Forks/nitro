import { expectTypeOf } from 'expect-type'
import { describe, it } from 'vitest'
import { $Fetch, InternalApi } from '../..'

interface TestResponse { message: string }

const $fetch = {} as $Fetch

describe('API routes', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dynamicString: string = ''

  it('generates types for middleware, unknown and manual typed routes', () => {
    expectTypeOf($fetch('/')).toMatchTypeOf<Promise<InternalApi[keyof InternalApi]>>() // middleware
    expectTypeOf($fetch('/api/unknown')).toEqualTypeOf<Promise<unknown>>()
    expectTypeOf($fetch<TestResponse>('/test')).toEqualTypeOf<Promise<TestResponse>>()
  })

  it('generates types for routes with exact matches', () => {
    expectTypeOf($fetch('/api/hello')).toEqualTypeOf<Promise<{ message: string }>>()
    expectTypeOf($fetch('/api/typed/user/john')).toEqualTypeOf<Promise<{ internalApiKey: '/api/typed/user/john' }>>()
    expectTypeOf($fetch('/api/typed/user/john/post/coffee')).toEqualTypeOf<Promise<{ internalApiKey: '/api/typed/user/john/post/coffee' }>>()
  })

  it('generates types for routes matching params', () => {
    expectTypeOf($fetch('/api/typed/user/{someUserId}')).toEqualTypeOf<Promise<{ internalApiKey: '/api/typed/user/:userId' }>>()
    expectTypeOf($fetch('/api/typed/user/{someUserId}/{extends}')).toEqualTypeOf<Promise<{ internalApiKey: '/api/typed/user/:userId/:userExtends' }>>()
    expectTypeOf($fetch('/api/typed/user/john/{extends}')).toEqualTypeOf<Promise<{ internalApiKey: '/api/typed/user/john/:johnExtends' }>>()
    expectTypeOf($fetch('/api/typed/user/{someUserId}/post/{somePostId}')).toEqualTypeOf<Promise<{ internalApiKey: '/api/typed/user/:userId/post/:postId' }>>()
  })

  it('generates types for routes (w/o dynamic template literal) and with param and exact matches', () => {
    expectTypeOf($fetch('/api/typed/user/john/post/{somePostId}')).toEqualTypeOf<Promise<{ internalApiKey: '/api/typed/user/john/post/:postId' }>>()
    expectTypeOf($fetch(`/api/typed/user/${dynamicString}/post/firstPost`)).toEqualTypeOf<Promise<{ internalApiKey: '/api/typed/user/:userId/post/firstPost' }>>()
    expectTypeOf($fetch(`/api/typed/user/${dynamicString}`)).toEqualTypeOf<Promise<
      | { internalApiKey: '/api/typed/user/john' }
      | { internalApiKey: '/api/typed/user/:userId' }
    >>()
    expectTypeOf($fetch(`/api/typed/user/john/post/${dynamicString}`)).toEqualTypeOf<Promise<
      | { internalApiKey: '/api/typed/user/john/post/coffee' }
      | { internalApiKey: '/api/typed/user/john/post/:postId' }
    >>()
    expectTypeOf($fetch(`/api/typed/user/{someUserId}/post/${dynamicString}`)).toEqualTypeOf<Promise<
      | { internalApiKey: '/api/typed/user/:userId/post/:postId' }
      | { internalApiKey: '/api/typed/user/:userId/post/firstPost' }
    >>()
    expectTypeOf($fetch(`/api/typed/user/${dynamicString}/post/${dynamicString}`)).toEqualTypeOf<Promise<
      | { internalApiKey: '/api/typed/user/john/post/coffee' }
      | { internalApiKey: '/api/typed/user/john/post/:postId' }
      | { internalApiKey: '/api/typed/user/:userId/post/:postId' }
      | { internalApiKey: '/api/typed/user/:userId/post/firstPost' }
    >>()
  })

  it('generates types for routes matching prefix', () => {
    expectTypeOf($fetch('/api/hey/**')).toEqualTypeOf<Promise<string>>()
    expectTypeOf($fetch('/api/param/{id}/**')).toEqualTypeOf<Promise<any>>()
    expectTypeOf($fetch('/api/typed/user/{someUserId}/post/{somePostId}/**')).toEqualTypeOf<Promise<{ internalApiKey: '/api/typed/user/:userId/post/:postId' }>>()
    expectTypeOf($fetch('/api/typed/user/john/post/coffee/**')).toEqualTypeOf<Promise<{ internalApiKey: '/api/typed/user/john/post/coffee' }>>()
    expectTypeOf($fetch(`/api/typed/user/${dynamicString}/post/${dynamicString}/**`)).toEqualTypeOf<Promise<
      | { internalApiKey: '/api/typed/user/john/post/coffee' }
      | { internalApiKey: '/api/typed/user/john/post/:postId' }
      | { internalApiKey: '/api/typed/user/:userId/post/:postId' }
      | { internalApiKey: '/api/typed/user/:userId/post/firstPost' }
    >>()
  })

  it('ignores query suffixes', () => {
    expectTypeOf($fetch('/api/hey?test=true')).toEqualTypeOf<Promise<string>>()
    expectTypeOf($fetch('/api/hello?')).toEqualTypeOf<Promise<{ message: string }>>()
  })

  it('generates types for routes matching Api keys with /** globs', () => {
    expectTypeOf($fetch('/api/wildcard/foo/bar')).toEqualTypeOf<Promise<any>>()
    expectTypeOf($fetch('/api/typed/todos/parent/child')).toEqualTypeOf<Promise<
      { internalApiKey: '/api/typed/todos/**' }
    >>()
    expectTypeOf($fetch(`/api/typed/todos/${dynamicString}/child`)).toEqualTypeOf<Promise<
      | { internalApiKey: '/api/typed/todos/**' }
    >>()
    expectTypeOf($fetch(`/api/typed/todos/some/deeply/nest/${dynamicString}/path`)).toEqualTypeOf<Promise<
      | { internalApiKey: '/api/typed/todos/**' }
    >>()
    expectTypeOf($fetch('/api/typed/todos/firstTodo/comments/foo')).toEqualTypeOf<Promise<
      | { internalApiKey: '/api/typed/todos/**' }
      | { internalApiKey: '/api/typed/todos/:todoId/comments/**:commentId' }
    >>()
    expectTypeOf($fetch(`/api/typed/todos/firstTodo/comments/${dynamicString}`)).toEqualTypeOf<Promise<
      | { internalApiKey: '/api/typed/todos/**' }
      | { internalApiKey: '/api/typed/todos/:todoId/comments/**:commentId' }
    >>()
    expectTypeOf($fetch(`/api/typed/todos/${dynamicString}/${dynamicString}/foo/bar/baz`)).toEqualTypeOf<Promise<
      | { internalApiKey: '/api/typed/todos/**' }
      | { internalApiKey: '/api/typed/todos/:todoId/comments/**:commentId' }
    >>()
    expectTypeOf($fetch(`/api/typed/catchall/${dynamicString}/foo/bar/baz`)).toEqualTypeOf<Promise<
      | { internalApiKey: '/api/typed/catchall/:slug/**:another' }
      | { internalApiKey: '/api/typed/catchall/some/**:test' }
    >>()
    expectTypeOf($fetch('/api/typed/catchall/some/foo/bar/baz')).toEqualTypeOf<Promise<
      | { internalApiKey: '/api/typed/catchall/some/**:test' }
    >>()
  })
})
