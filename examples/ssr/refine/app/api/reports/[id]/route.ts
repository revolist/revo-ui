export async function PATCH(request: Request) {
  const { title } = await request.json();
  if (typeof title !== 'string' || !title.trim()) {
    return Response.json({ message: 'Title is required.' }, { status: 400 });
  }
  return Response.json({ id: 1, title: title.trim() });
}
