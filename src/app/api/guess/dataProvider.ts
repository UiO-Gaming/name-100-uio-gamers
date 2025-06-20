import type { Match } from "@/types";

export async function findNorwegianPerson(input: string): Promise<Match> {
  const apiUrl = `https://snl.no/api/v1/search?query=${encodeURIComponent(input)}&limit=5`;
  const response = await fetch(apiUrl);
  const data = await response.json();

  function isNorwegianPerson(item: any): boolean {
    // Must be a biography
    if (item.article_type_id !== 2) return false;

    if (typeof item.rank !== "number" || item.rank <= 100) return false;

    // Must mention Norwegian-ness in any relevant field
    const combinedText = [
      item.taxonomy_title || "",
      item.subject_title || "",
      item.first_sentences || "",
      item.snippet || "",
    ].join(" ");
    return /(norsk|norske|norges|norge)/i.test(combinedText);
  }

  // Filter for Norwegian biographies with strong match
  const people = (data.hits || data).filter(isNorwegianPerson);

  if (people.length > 0) {
    const person = people[0];
    const description = await (async () => {
      try {
        const articleJsonRes = await fetch(person.article_url_json);
        const articleJson = await articleJsonRes.json();

        if (articleJson.metadata && articleJson.metadata.occupation) {
          return articleJson.metadata.occupation;
        } else if (articleJson.subject_title) {
          return articleJson.subject_title;
        }
      } catch (e) {
        // fallback to undefined
      }
      return undefined;
    })();

    return {
      input,
      name: person.title || person.headword,
      description,
      correct: true,
    };
  } else {
    return {
      input,
      name: undefined,
      description: undefined,
      correct: false,
    };
  }
}
