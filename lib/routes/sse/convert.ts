import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/convert/:query?',
    categories: ['finance'],
    example: '/sse/convert/beginDate=2018-08-18&endDate=2019-08-18&companyCode=603283&title=股份',
    parameters: { query: '筛选条件，见示例' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '可转换公司债券公告',
    maintainers: ['kt286'],
    handler,
};

async function handler(ctx) {
    const query = ctx.req.param('query') ?? ''; // beginDate=2018-08-18&endDate=2019-08-18&companyCode=603283&title=股份
    const pageUrl = 'https://bond.sse.com.cn/disclosure/announ/convertible/';
    const host = 'https://www.sse.com.cn';
    const queries: Record<string, string> = {};
    if (query) {
        const pairs = query.split('&');
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            if (key) {
                queries[key] = value;
            }
        }
    }

    const response = await got('https://query.sse.com.cn/infodisplay/queryBulletinKzzTipsNew.do', {
        searchParams: {
            isPagination: true,
            'pageHelp.pageSize': 20,
            flag: 0,
            _: Date.now(),
            ...queries,
        },
        headers: {
            Referer: pageUrl,
        },
    });

    const items = response.data.result.map((item) => ({
        title: item.title,
        description: `${host}${item.URL}`,
        pubDate: parseDate(item.ADDDATE),
        link: `${host}${item.URL}`,
        author: item.security_Code,
    }));

    return {
        title: '上证债券信息网 - 可转换公司债券公告',
        link: pageUrl,
        item: items,
    };
}
