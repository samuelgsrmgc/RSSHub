import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/system-update',
    categories: ['game'],
    example: '/nintendo/system-update',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['nintendo.co.jp/support/switch/system_update/index.html', 'nintendo.co.jp/'],
        },
    ],
    name: 'Switch System Update（Japan）',
    maintainers: ['hoilc'],
    handler,
    url: 'nintendo.co.jp/support/switch/system_update/index.html',
};

async function handler() {
    const url = 'https://www.nintendo.co.jp/support/switch/system_update/index.html';

    const response = await got(url);
    const $ = load(response.data);

    const list = $('.c-heading-lv3').toArray().slice(1, -2);

    return {
        title: 'Nintendo Switch 本体更新情報',
        link: url,
        item: list.map((update) => {
            update = $(update);
            const heading = update.text();
            const matched_date = /(\d+)年(\d+)月(\d+)日/.exec(heading);
            const update_info = update.nextUntil('.c-heading-lv3');
            const update_infos = update_info
                .toArray()
                .map((element) => $(element).html())
                .join('\n');
            const matched_version = /(\d\.)+\d/.exec(heading);

            return {
                title: heading,
                author: 'Nintendo',
                description: update_infos,
                link: url,
                guid: `${url}#${matched_version[0]}`,
                pubDate: new Date(Number.parseInt(matched_date[1]), Number.parseInt(matched_date[2]) - 1, Number.parseInt(matched_date[3])),
            };
        }),
    };
}
