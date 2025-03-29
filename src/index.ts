#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const SINA_API_BASE = 'https://hq.sinajs.cn/list';

// Create server instance
const server = new McpServer({
	name: 'stock',
	version: '1.0.0',
	capabilities: {
		resources: {},
		tools: {},
	},
});

// Helper function for making Sina Finance API requests
async function makeStockRequest<T>(symbol: string): Promise<T | null> {
	const url = `${SINA_API_BASE}=${symbol}`;
	const headers = {
		Referer: 'https://finance.sina.com.cn',
	};

	try {
		const response = await fetch(url, { headers });
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const buffer = await response.arrayBuffer();
		const decoder = new TextDecoder('gb2312');
		const text = decoder.decode(buffer);
		const data = parseSinaStockData(text, symbol);
		return data as T;
	} catch (error) {
		console.error('Error making stock request:', error);
		return null;
	}
}

interface StockQuote {
	symbol: string;
	name: string;
	open: string;
	close: string;
	price: string;
	high: string;
	low: string;
	volume: string;
	amount: string;
	date: string;
	time: string;
}

function parseSinaStockData(text: string, symbol: string): StockQuote | null {
	const matches = text.match(/"(.*)"/);
	if (!matches || !matches[1]) return null;

	const values = matches[1].split(',');
	if (values.length < 32) return null;

	return {
		symbol,
		name: values[0],
		open: values[1],
		close: values[2],
		price: values[3],
		high: values[4],
		low: values[5],
		volume: values[8],
		amount: values[9],
		date: values[30],
		time: values[31],
	};
}

// Format quote data
function formatQuote(quote: StockQuote): string {
	return [
		`Stock Code: ${quote.symbol}`,
		`Stock Name: ${quote.name}`,
		`Current Price: ¥${quote.price}`,
		`Change Rate: ${(((Number(quote.price) - Number(quote.close)) / Number(quote.close)) * 100).toFixed(2)}%`,
		`Open Price: ¥${quote.open}`,
		`High Price: ¥${quote.high}`,
		`Low Price: ¥${quote.low}`,
		`Volume: ${(Number(quote.volume) / 100).toFixed(0)} lots`,
		`Turnover: ¥${(Number(quote.amount) / 10000).toFixed(2)} million`,
		`Update Time: ${quote.date} ${quote.time}`,
		'---',
	].join('\n');
}

// Register stock tools
server.tool(
	'get-quote',
	'Get real-time stock quote',
	{
		symbol: z.string().describe('Stock symbol (e.g.: sh600000, sz000001)'),
	},
	async ({ symbol }) => {
		const quoteData = await makeStockRequest<StockQuote>(symbol);

		if (!quoteData) {
			return {
				content: [
					{
						type: 'text',
						text: `Failed to retrieve stock data for ${symbol}`,
					},
				],
			};
		}

		const formattedQuote = formatQuote(quoteData);
		return {
			content: [
				{
					type: 'text',
					text: formattedQuote,
				},
			],
		};
	}
);

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error('Stock MCP Server running on stdio');
}

main().catch((error) => {
	console.error('Fatal error in main():', error);
	process.exit(1);
});
