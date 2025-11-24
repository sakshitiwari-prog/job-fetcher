import { parseString } from 'xml2js';
import jobQueue from '../queue/queue.js';
import ImportLog from "../model/ImportLog.model.js";

export async function importFromUrl() {
  const log = {
    startedAt: new Date(),
    sourceCount: 0,
    totalFetched: 0,
    queued: 0,
    filename: [] 
  };

  try {

    const list_apis = [
      "https://jobicy.com/?feed=job_feed",
      "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
      "https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france",
      "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
      "https://jobicy.com/?feed=job_feed&job_categories=data-science",
      "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
      "https://jobicy.com/?feed=job_feed&job_categories=business",
      "https://jobicy.com/?feed=job_feed&job_categories=management",
      "https://www.higheredjobs.com/rss/articleFeed.cfm"
    ];
    log.sourceCount = list_apis.length;
    log.filename = list_apis; 

    const xmlResponses = await Promise.all(
      list_apis.map(async (url) => {
        const resp = await fetch(url);
        return await resp.text();
      })
    );

    for (let i = 0; i < xmlResponses.length; i++) {
      const xml = xmlResponses[i];
      const feedUrl = list_apis[i];

      await new Promise((resolve) =>
        parseString(xml, async (err, result) => {
          if (err) return resolve();

          const items =
            result?.rss?.channel?.[0]?.item ||
            result?.channel?.item ||
            [];

          log.totalFetched += items.length;

          for (const item of items) {
            const jobData = {
              guid: item.guid?.[0]?._ || item.guid?.[0] || item.link?.[0],
              title: item.title?.[0],
              description: item.description?.[0],
              location: item["job:location"]?.[0],
              company: item["job:company"]?.[0],
              url: item.link?.[0],
              raw: item,
              source: feedUrl, 
            };
            if (!jobData.guid) continue;

            log.queued++;
            await jobQueue.add("importJob", jobData);
          }

          resolve();
        })
      );
    }

    log.finishedAt = new Date();
    await ImportLog.create(log);

  } catch (err) {
    log.finishedAt = new Date();
    await ImportLog.create(log);
    console.error("Import failed:", err);
  }
}
