// This will throw a type error because it's not one of the allowed values!
// export const dynamic = 'some-random-string'

export default async function BlogPostPage(props: PageProps<'/blog/[slug]'>) {
  const params = await props.params

  return (
    <div>
      <h2>Blog Post: {params.slug}</h2>
      <p>This is a blog post about {params.slug}.</p>
    </div>
  )
}
