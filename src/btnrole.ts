import {
	ButtonStyle,
	Role,
	Message,
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder
} from 'discord.js';
import { ExtendedInteraction, ExtendedMessage } from './interfaces';

import { SimplyError } from './Error/Error';
import chalk from 'chalk';
import { LegacyStyles, styleObj } from './interfaces';

// ------------------------------
// ------- T Y P I N G S --------
// ------------------------------

interface dataObj {
	role?: string;
	label?: string;
	emoji?: string;
	style?: ButtonStyle;
	url?: `https://${string}`;
}

export type btnOptions = {
	embed?: EmbedBuilder;
	content?: string;
	data?: dataObj[];
};

// ------------------------------
// ------ F U N C T I O N -------
// ------------------------------

/**
 * A **Button Role System** that lets you create button roles with your own message. | *Requires: [**manageBtn()**](https://simplyd.js.org/docs/handler/manageBtn)*
 * @param message
 * @param options
 * @link `Documentation:` ***https://simplyd.js.org/docs/General/btnrole***
 * @example simplydjs.btnRole(message, { data: {...} })
 */

export async function btnRole(
	message: ExtendedMessage | ExtendedInteraction,
	options: btnOptions = {}
): Promise<Message> {
	try {
		if (!options.data)
			throw new SimplyError({
				name: 'NOT_SPECIFIED | Provide an data option to make buttons.',
				tip: `Expected data object in options.. Received ${
					options.data || 'undefined'
				}`
			});

		const msg = message as ExtendedMessage;
		const int = message as ExtendedInteraction;

		if (message.commandId) {
			if (!int.member.permissions.has('Administrator'))
				int.followUp({
					content: 'You need `ADMINISTRATOR` permission to use this command'
				});
			return;
		} else if (!message.customId) {
			if (!msg.member.permissions.has('Administrator'))
				return await msg.reply({
					content: 'You need `ADMINISTRATOR` permission to use this command'
				});
		}

		const row: any[] = [];
		const data = options.data;

		if (data.length <= 5) {
			const button: any[][] = [[]];
			btnEngine(data, button, row);
		} else if (data.length > 5 && data.length <= 10) {
			const button: any[][] = [[], []];
			btnEngine(data, button, row);
		} else if (data.length > 11 && data.length <= 15) {
			const button: any[][] = [[], [], []];
			btnEngine(data, button, row);
		} else if (data.length > 16 && data.length <= 20) {
			const button: any[][] = [[], [], [], []];
			btnEngine(data, button, row);
		} else if (data.length > 21 && data.length <= 25) {
			const button: any[][] = [[], [], [], [], []];
			btnEngine(data, button, row);
		} else if (data.length > 25) {
			throw new SimplyError({
				name: 'Reached the limit of 25 buttons..',
				tip: 'Discord allows only 25 buttons in a message. Send a new message with more buttons.'
			});
		}
		async function btnEngine(data: dataObj[], button: any[][], row: any[]) {
			let current = 0;

			for (let i = 0; i < data.length; i++) {
				if (button[current].length === 5) current++;

				const emoji = data[i].emoji || null;
				let clr = data[i].style || 'SECONDARY';

				clr = (clr as ButtonStyle) || styleObj[clr as LegacyStyles];

				let url = '';
				const role: Role | null = message.guild.roles.cache.find(
					(r) => r.id === data[i].role
				);
				const label = data[i].label || role?.name;

				if (!role && clr === ButtonStyle.Link) {
					url = data[i].url;
					button[current].push(createLink(label, url, emoji));
				} else {
					button[current].push(createButton(label, role, clr, emoji));
				}

				if (i === data.length - 1) {
					const rero = addRow(button[current]);
					row.push(rero);
				}
			}

			if (!options.embed && !options.content)
				throw new SimplyError({
					name: 'NOT_SPECIFIED | Provide an embed (or) content in the options.',
					tip: `Expected embed (or) content options to send. Received ${
						options.embed || options.content || 'undefined'
					}`
				});

			const emb = options.embed;

			if ((message as ExtendedInteraction).commandId) {
				if (!options.embed) {
					(message as ExtendedInteraction).followUp({
						content: options.content || '** **',
						components: row
					});
				} else
					(message as ExtendedInteraction).followUp({
						content: options.content || '** **',
						embeds: [emb],
						components: row
					});
			} else if (!(message as ExtendedInteraction).commandId) {
				if (!options.embed) {
					message.channel.send({
						content: options.content || '** **',
						components: row
					});
				} else
					message.channel.send({
						content: options.content || '** **',
						embeds: [emb],
						components: row
					});
			}

			function addRow(btns: any[]): ActionRowBuilder {
				const row1 = new ActionRowBuilder();

				row1.addComponents(btns);

				return row1;
			}

			function createLink(
				label: string,
				url: string,
				emoji: string
			): ButtonBuilder {
				const btn = new ButtonBuilder();
				if (!emoji || emoji === null) {
					btn.setLabel(label).setStyle(styleObj['LINK']).setURL(url);
				} else if (emoji && emoji !== null) {
					btn
						.setLabel(label)
						.setStyle(styleObj['LINK'])
						.setURL(url)
						.setEmoji(emoji);
				}
				return btn;
			}

			function createButton(
				label: string,
				role: Role,
				color: ButtonStyle,
				emoji: string
			): ButtonBuilder {
				const btn = new ButtonBuilder();
				if (!emoji || emoji === null) {
					btn
						.setLabel(label)
						.setStyle(color)
						.setCustomId('role-' + role.id);
				} else if (emoji && emoji !== null) {
					btn
						.setLabel(label)
						.setStyle(color)
						.setCustomId('role-' + role.id)
						.setEmoji(emoji);
				}
				return btn;
			}
		}
	} catch (err: any) {
		console.log(
			`${chalk.red('Error Occured.')} | ${chalk.magenta('btnRole')} | Error: ${
				err.stack
			}`
		);
	}
}
