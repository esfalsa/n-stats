<script lang="ts">
	import { nations, userAgent } from '$lib/stores';
	import { createForm } from 'felte';
	import { get } from 'svelte/store';
	import { fetch, ResponseType } from '@tauri-apps/api/http';

	const parser = new DOMParser();

	let nukes = 0,
		shield = 0,
		production = 0,
		intercepts = 0,
		strikes = 0,
		radiation = 0,
		destroyed = 0;

	let index = 0;

	type FormData = {
		nations: string;
		userAgent: string;
	};

	const { form } = createForm({
		onSubmit: (values: FormData) => {
			$nations = values.nations.split(',').map((nation) => nation.trim());
			$userAgent = `N-Stats; script by Esfalsa; in use by ${values.userAgent}`;
		}
	});

	async function loadNationData(nation: string) {
		const endpoint = new URL(
			`https://www.nationstates.net/template-overall=none/nation=${nation}/page=nukes`
		);
		const headers = {
			'User-Agent': $userAgent,
			userclick: Date.now().toString()
		};

		const { data } = await fetch<string>(endpoint.toString(), {
			method: 'GET',
			query: headers,
			headers: headers,
			responseType: ResponseType.Text
		});

		const document = parser.parseFromString(data, 'text/html');

		const nukesNode = document.querySelector('.nukestat.nukestat-nukes')?.textContent;
		const shieldNode = document.querySelector('.nukestat.nukestat-shield')?.textContent;
		const productionNode = document.querySelector('.nukestat.nukestat-production')?.textContent;
		// const targetsNode = document.querySelector('.nukestat.nukestat-targets')?.textContent;
		// const launchesNode = document.querySelector('.nukestat.nukestat-launches')?.textContent;
		const interceptsNode = document.querySelector('.nukestat.nukestat-intercepts')?.textContent;
		const strikesNode = document.querySelector('.nukestat.nukestat-strikes')?.textContent;
		// const targetedNode = document.querySelector('.nukestat.nukestat-targeted')?.textContent;
		// const incomingNode = document.querySelector('.nukestat.nukestat-incoming')?.textContent;
		const radiationNode = document.querySelector('.nukestat.nukestat-radiation')?.textContent;

		nukes += parseInt(nukesNode?.substring(0, nukesNode?.indexOf('NUKES')) || '0');
		shield += parseInt(shieldNode?.substring(0, shieldNode?.indexOf('SHIELD')) || '0');
		production += parseInt(
			productionNode?.substring(0, productionNode?.indexOf('PRODUCTION')) || '0'
		);
		intercepts += parseInt(
			interceptsNode?.substring(0, interceptsNode?.indexOf('INTERCEPTS')) || '0'
		);
		strikes += parseInt(strikesNode?.substring(0, strikesNode?.indexOf('STRIKES')) || '0');
		radiation += parseInt(radiationNode?.substring(0, radiationNode?.indexOf('%RADIATION')) || '0');
		destroyed += radiation == 100 ? 1 : 0;
	}
</script>

<h1>N-Stats</h1>

{#if $nations.length}
	<p><strong>RUNNING TOTALS</strong></p>
	<p>
		<strong>nukes:</strong>
		{nukes},
		<strong>shield:</strong>
		{shield},
		<strong>production:</strong>
		{production},
		<strong>intercepts:</strong>
		{intercepts},
		<strong>strikes:</strong>
		{strikes},
		<strong>radiation:</strong>
		{radiation}
		<strong>destroyed:</strong>
		{destroyed}
	</p>

	{#if index < $nations.length}
		<p>
			<button
				on:click={async (e) => {
					const target = e.currentTarget;
					target.disabled = true;
					await loadNationData($nations[index]);
					index++;
					target.disabled = false;
				}}>Load {$nations[index]} data</button
			>
		</p>
	{:else}
		<p>Data for all nations has been loaded.</p>
	{/if}
{:else}
	<form use:form>
		<input
			required
			type="text"
			name="userAgent"
			id="userAgent"
			placeholder="Your main nation name"
		/>

		<textarea
			required
			placeholder="Nations, in a comma-separated list"
			name="nations"
			id="nations"
		/>

		<button type="submit">Submit</button>
	</form>
{/if}

<style>
	:root {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
			'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
	}

	input,
	textarea,
	button[type='submit'] {
		display: block;
	}
</style>
