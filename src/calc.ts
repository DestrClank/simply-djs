import {
	MessageButtonStyle,
	MessageEmbed,
	MessageButton,
	MessageActionRow,
	MessageEmbedAuthor,
	MessageEmbedFooter,
	ColorResolvable,
	ButtonInteraction
} from 'discord.js';
import { ExtendedInteraction, ExtendedMessage } from './interfaces';

import chalk from 'chalk';

// ------------------------------
// ------- T Y P I N G S --------
// ------------------------------

/**
 * **URL** of the Type: *https://simplyd.js.org/docs/types/CustomizableEmbed*
 */

interface CustomizableEmbed {
	author?: MessageEmbedAuthor;
	title?: string;
	footer?: MessageEmbedFooter;
	color?: ColorResolvable;
	description?: string;

	credit?: boolean;
}

/**
 * **URL** of the Type: *https://simplyd.js.org/docs/General/calculator#calcbuttons*
 */

interface calcButtons {
	numbers?: MessageButtonStyle;
	symbols?: MessageButtonStyle;
	delete?: MessageButtonStyle;
}

export type calcOptions = {
	embed?: CustomizableEmbed;
	buttons?: calcButtons;
};

// ------------------------------
// ------ F U N C T I O N -------
// ------------------------------

/**
 * An Unique **calculator** which can be *used inside Discord*
 * @param interaction
 * @param options
 * @link `Documentation:` ***https://simplyd.js.org/docs/General/calculator***
 * @example simplydjs.calculator(interaction)
 */

export async function calculator(
	interaction: ExtendedMessage | ExtendedInteraction,
	options: calcOptions = {
		buttons: { numbers: 'SECONDARY', symbols: 'PRIMARY', delete: 'DANGER' }
	}
): Promise<void> {
	try {
		const button: any[][] = [[], [], [], [], []];
		const row: any[] = [];
		const text: string[] = [
			'Clear',
			'(',
			')',
			'/',
			'⌫',
			'7',
			'8',
			'9',
			'*',
			'%',
			'4',
			'5',
			'6',
			'-',
			'^',
			'1',
			'2',
			'3',
			'+',
			'π',
			'.',
			'0',
			'00',
			'=',
			'Suppr'
		];
		let current = 0;

		if (!options.embed) {
			options.embed = {
				footer: {
					text: '©️ Simply Develop. npm i simply-djs',
					iconURL: 'https://i.imgur.com/u8VlLom.png'
				},
				color: '#075FFF',
				credit: true
			};
		}

		options.buttons = {
			numbers: options.buttons?.numbers || 'SECONDARY',
			symbols: options.buttons?.symbols || 'PRIMARY',
			delete: options.buttons?.delete || 'DANGER'
		};

		let message;

		if (!interaction.commandId) {
			message = interaction;
		}

		for (let i = 0; i < text.length; i++) {
			if (button[current].length === 5) current++;
			button[current].push(createButton(text[i]));
			if (i === text.length - 1) {
				for (const btn of button) row.push(addRow(btn));
			}
		}

		const emb1 = new MessageEmbed()
			.setColor(options.embed?.color || '#075FFF')
			.setFooter(
				options.embed?.credit === false
					? options.embed?.footer
					: {
							text: '©️ Simply Develop. npm i simply-djs',
							iconURL: 'https://i.imgur.com/u8VlLom.png'
					  }
			)
			.setDescription(
				'```js\n0\n// Result: 0\n```' +
					(options.embed?.description ? `\n${options.embed?.description}` : '')
			);

		if (options.embed?.author) {
			emb1.setAuthor(options.embed?.author);
		}
		if (options.embed?.title) {
			emb1.setTitle(options.embed?.title);
		}

		let msg: any;

		const int = interaction as ExtendedInteraction;
		const ms = interaction as ExtendedMessage;

		if (!message) {
			await int.reply({
				embeds: [emb1],
				components: row
			});

			msg = await int.fetchReply();
		} else if (message) {
			msg = await ms.reply({
				embeds: [emb1],
				components: row
			});
		}

		const time = 300000;

		let elem = '0';

		const filter = (button: ButtonInteraction) =>
			button.user?.id ===
				(interaction.user ? interaction.user : interaction.author).id &&
			button.customId.startsWith('cal-');

		const collect = msg.createMessageComponentCollector({
			filter,
			componentType: 'BUTTON',
			time: time
		});

		collect.on('collect', async (button: ButtonInteraction) => {
			await button.deferUpdate();

			const btnName: any = button.customId.replace('cal-', '');

			if (elem === '0') elem = '';

			if (btnName === '=') {
				elem = mathEval(elem, true);

				emb1.setDescription(
					`\`\`\`js\n${elem}\n\`\`\`` +
						(options.embed?.description
							? `\n${options.embed?.description}`
							: '')
				);

				elem = '0';

				return await msg
					.edit({
						embeds: [emb1],
						components: row
					})
					.catch(() => {});
			}

			elem = elem + btnName.toString();

			if (btnName === 'Suppr') return await msg.delete().catch(() => {});
			else if (btnName === 'Clear') elem = '0';
			if (btnName === '⌫') elem = elem.slice(0, -2);

			if (isNaN(btnName) && btnName !== '⌫') {
				emb1.setDescription(
					`\`\`\`js\n${elem
						.replaceAll('+', ' + ')
						.replaceAll('*', ' * ')}\n\t\n\`\`\`` +
						(options.embed?.description
							? `\n${options.embed?.description}`
							: '')
				);
				return await msg
					.edit({
						embeds: [emb1],
						components: row
					})
					.catch(() => {});
			}

			emb1.setDescription(
				`\`\`\`js\n${elem
					.replaceAll('+', ' + ')
					.replaceAll('*', ' * ')}\n// Résultat : ${mathEval(elem)
					.replaceAll('^', '**')
					.replaceAll('%', '/100')
					.replace(' ', '')}\n\`\`\`` +
					(options.embed?.description ? `\n${options.embed?.description}` : '')
			);
			await msg
				.edit({
					embeds: [emb1],
					components: row
				})
				.catch(() => {});
		});

		setTimeout(async () => {
			if (!msg) return;
			if (!msg.editable) return;

			if (msg) {
				if (msg.editable) {
					emb1.setDescription(
						"Le temps d'utilisation de la calcuatrice est dépassée. (5 minutes)."
					);
					emb1.setColor(0xc90000);
					await msg.edit({ embeds: [emb1], components: [] }).catch(() => {});
				}
			}
		}, time);

		function addRow(btns: MessageButton[]) {
			const row1 = new MessageActionRow();
			for (const btn of btns) {
				row1.addComponents(btn);
			}
			return row1;
		}

		function createButton(
			label: any,
			style: MessageButtonStyle = options.buttons?.numbers
		) {
			if (label === 'Clear') style = options.buttons?.delete;
			else if (label === 'Suppr') style = options.buttons?.delete;
			else if (label === '⌫') style = options.buttons?.delete;
			else if (label === 'π') style = options.buttons?.numbers;
			else if (label === '%') style = options.buttons?.numbers;
			else if (label === '^') style = options.buttons?.numbers;
			else if (label === '.') style = options.buttons?.symbols;
			else if (label === '=') style = 'SUCCESS';
			else if (isNaN(label)) style = options.buttons?.symbols;
			const btn = new MessageButton()
				.setLabel(label)
				.setStyle(style)
				.setCustomId('cal-' + label);
			return btn;
		}

		const evalRegex = /^[0-9π\+\%\^\-*\/\.\(\)]*$/;
		function mathEval(input: string, result = false, symbol = false) {
			try {
				const matched = evalRegex.exec(input);
				if (!matched) return 'Invalide';

				if (result === false) {
					return `${Function(
						`"use strict";let π=Math.PI;return (${input})`
					)()}`;
				} else
					return `${input
						.replaceAll('**', '^')
						.replaceAll('/100', '%')} = ${Function(
						`"use strict";let π=Math.PI;return (${input})`
					)()}`;
			} catch {
				return 'Erreur de frappe';
			}
		}
	} catch (err: any) {
		console.log(
			`${chalk.red('Une erreur est survenue.')} | ${chalk.magenta(
				'calculator'
			)} | Error: ${err.stack}`
		);
	}
}
