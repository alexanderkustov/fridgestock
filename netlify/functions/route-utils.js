export function getItemId(event) {
  const queryId = event.queryStringParameters?.id;
  if (queryId) return decodeURIComponent(queryId);

  const paths = [event.path, event.rawUrl]
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value).pathname;
      } catch {
        return value.split('?')[0];
      }
    });

  for (const path of paths) {
    const match = path.match(/\/(?:api\/items|\.netlify\/functions\/(?:items|item-increment|item-decrement))\/([^/]+)(?:\/(?:increment|decrement))?\/?$/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  return null;
}
