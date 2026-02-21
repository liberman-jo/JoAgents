const { config } = require("../config");

const buildQuery = () => config.interests.join(" OR ");

const mapAuthors = (authors) =>
  (authors || []).map((author) => author.name || author.lastName || author).filter(Boolean);

const normalizeResult = (item) => ({
  source: item.source,
  title: item.title || "Untitled",
  authors: item.authors || [],
  venue: item.venue || "Unknown venue",
  publicationDate: item.publicationDate || "Unknown date",
  university: item.university || "Not listed",
  methods: item.methods || "Not available in metadata.",
  findings: item.findings || "Not available in metadata.",
  implications: item.implications || "Not available in metadata."
});

const fetchCrossref = async (isoDate) => {
  const query = encodeURIComponent(buildQuery());
  const endpoint =
    `https://api.crossref.org/works?filter=from-pub-date:${isoDate},until-pub-date:${isoDate}` +
    `&query.title=${query}&rows=10&select=title,author,issued,container-title,DOI,subject,abstract,author-affiliation`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  const items = (data.message && data.message.items) || [];
  return items.map((item) => {
    const affiliations = (item.author || [])
      .flatMap((author) => author.affiliation || [])
      .map((affil) => affil.name)
      .filter(Boolean);
    return normalizeResult({
      source: "Crossref",
      title: (item.title && item.title[0]) || "Untitled",
      authors: (item.author || []).map((author) => `${author.given || ""} ${author.family || ""}`.trim()),
      venue: (item["container-title"] && item["container-title"][0]) || "Unknown venue",
      publicationDate: (item.issued && item.issued["date-parts"] && item.issued["date-parts"][0])
        ? item.issued["date-parts"][0].join("-")
        : "Unknown date",
      university: affiliations[0] || "Not listed"
    });
  });
};

const fetchSemanticScholar = async () => {
  const query = encodeURIComponent(buildQuery());
  const endpoint =
    `https://api.semanticscholar.org/graph/v1/paper/search?query=${query}` +
    "&limit=10&fields=title,authors,year,venue,abstract,publicationDate";
  const response = await fetch(endpoint);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  const items = data.data || [];
  return items.map((item) =>
    normalizeResult({
      source: "Semantic Scholar",
      title: item.title,
      authors: (item.authors || []).map((author) => author.name),
      venue: item.venue || "Unknown venue",
      publicationDate: item.publicationDate || String(item.year || "Unknown date")
    })
  );
};

const fetchPubMed = async (isoDate) => {
  const query = encodeURIComponent(buildQuery());
  const pubDate = isoDate.replace(/-/g, "/");
  const searchEndpoint =
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}` +
    `&mindate=${pubDate}&maxdate=${pubDate}&retmode=json&retmax=10`;
  const searchResponse = await fetch(searchEndpoint);
  if (!searchResponse.ok) {
    return [];
  }
  const searchData = await searchResponse.json();
  const ids = (searchData.esearchresult && searchData.esearchresult.idlist) || [];
  if (!ids.length) {
    return [];
  }
  const summaryEndpoint =
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
  const summaryResponse = await fetch(summaryEndpoint);
  if (!summaryResponse.ok) {
    return [];
  }
  const summaryData = await summaryResponse.json();
  const resultMap = summaryData.result || {};
  return ids.map((id) => {
    const item = resultMap[id] || {};
    return normalizeResult({
      source: "PubMed",
      title: item.title,
      authors: mapAuthors(item.authors || []),
      venue: item.fulljournalname || "Unknown venue",
      publicationDate: item.pubdate || "Unknown date"
    });
  });
};

const getResearchSummary = async () => {
  const isoDate = new Date().toISOString().slice(0, 10);
  const [crossref, semantic, pubmed] = await Promise.all([
    fetchCrossref(isoDate),
    fetchSemanticScholar(),
    fetchPubMed(isoDate)
  ]);

  const results = [...crossref, ...semantic, ...pubmed];
  return {
    summary:
      results.length === 0
        ? "No research items found for today."
        : `Found ${results.length} items across Crossref, Semantic Scholar, and PubMed.`,
    items: results,
    sources: ["Crossref", "Semantic Scholar", "PubMed"]
  };
};

module.exports = { getResearchSummary };
