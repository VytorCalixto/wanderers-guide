import { convertTiptapToMarkdown } from '@common/rich_text_input/utils';
import { makeRequest } from '@requests/request-manager';
import { Campaign, CampaignNPC, CampaignSessionIdea, Character } from '@typing/content';
import yaml from 'js-yaml';

export async function generateCompletion(prompt?: string, model = 'gpt-4o-mini') {
  if (!prompt) return null;
  const result = await makeRequest<string>('open-ai-request', {
    content: prompt.trim(),
    model: model,
  });
  return result;
}

export async function randomCharacterInfo(character: Character) {
  const prompt = `
  From the following information about a TTRPG character, generate the following information: about them.

  ## Name:
  ${character.name}
  ## Level:
  ${character.level}

  ## Class:
  ${character.details?.class?.name}

  ## Background:
  ${character.details?.background?.name}

  ## Ancestry:
  ${character.details?.ancestry?.name}


  Here's the information I need, please fill in this JSON object with basic information.
  Be creative but keep each field to one sentence max. Do more with less.
  {
    appearance: string;
    personality: string;
    alignment: string;
    beliefs: string;
    age: string;
    height: string;
    weight: string;
    gender: string;
    pronouns: string;
    faction: string;
    ethnicity: string;
    nationality: string;
    birthplace: string;
  }


  Only return the JSON object with the information filled in. DO NOT INCLUDE \`\`\`json\`\`\` in your response.
  The resulting object:
  `.trim();
  const result = await generateCompletion(prompt, 'gpt-4o-mini');
  try {
    const data = yaml.load(result ?? '') as any;
    character.details = {
      ...character.details,
      info: {
        ...character.details?.info,
        appearance: `${data?.appearance}`,
        personality: `${data?.personality}`,
        alignment: `${data?.alignment}`,
        beliefs: `${data?.beliefs}`,
        age: `${data?.age}`,
        height: `${data?.height}`,
        weight: `${data?.weight}`,
        gender: `${data?.gender}`,
        pronouns: `${data?.pronouns}`,
        faction: `${data?.faction}`,
        ethnicity: `${data?.ethnicity}`,
        nationality: `${data?.nationality}`,
        birthplace: `${data?.birthplace}`,
      },
    };
    return character;
  } catch (e) {
    console.warn('Failed to parse response', e);
    return character;
  }
}

export async function classifySkillForAction(description: string) {
  const prompt = `
  Please determine the most appropriate skill for the action with the following description.
  Only respond with the skill name that is most appropriate for the action.
  If you are unsure, please respond with "unsure".

  ## Description:
  ${description}

  ## Skills:
    ACROBATICS
    ARCANA
    ATHLETICS
    CRAFTING
    DECEPTION
    DIPLOMACY
    INTIMIDATION
    MEDICINE
    NATURE
    OCCULTISM
    PERFORMANCE
    RELIGION
    SOCIETY
    STEALTH
    SURVIVAL
    THIEVERY
    LORE
  `.trim();
  return await generateCompletion(prompt);
}

export async function generateNPC(
  campaign: Campaign,
  players: Character[],
  notePages: number[],
  additional?: string
): Promise<CampaignNPC | null> {
  const prompt = `
  I’m going to give you some information about a Pathfinder/ Starfinder / D&D campaign and I need you to generate an NPC for it.
  Be creative and have fun with it, the most interesting NPCs are ones that embrace archetypes and are complex and interesting.
  The ancestry, background, and class should be the name from the options you could select in Pathfinder / Starfinder.
  The NPC level should be within the range 1-20.

  # Campaign Basic Info:
  Name: ${campaign.name}
  Description: ${campaign.description}
  Additional Info: ${additional ?? 'None provided'}


  # Players:
  ${players
    .map((player) => {
      return `Name: ${player.name}\n Level: ${player.level}\n Class: ${player.details?.class?.name}\n Background: ${player.details?.background?.name}\n Ancestry: ${player.details?.ancestry?.name} \n Details: ${JSON.stringify(player.details?.info ?? {})}\n`;
    })
    .join('\n\n-----\n\n')}


  # Campaign Notes:
  ${campaign.notes?.pages
    .filter((_page, index) => notePages.includes(index))
    ?.map((page) => '### ' + page.name + '\n' + convertTiptapToMarkdown(page.contents))
    .join('\n\n')}

      
  # Output Format:
  {
    name: string;
    description: string;
    level: number;
    class: string;
    background: string;
    ancestry: string;
  }


  Use markdown to format your output. at the Only return the JSON object with the information filled in. DO NOT INCLUDE \`\`\`json\`\`\` in your response.
  # Output:
  `.trim();
  const result = await generateCompletion(prompt, 'gpt-4o-mini');

  try {
    return yaml.load(result ?? '') as any;
  } catch (e) {
    console.warn('Failed to parse response', e);
    return null;
  }
}

export async function generateSessionIdea(
  campaign: Campaign,
  players: Character[],
  notePages: number[],
  additional?: string
): Promise<CampaignSessionIdea | null> {
  const prompt = `
  I’m going to give you some information about a Pathfinder/ Starfinder / D&D campaign and I need you to generate a campaign the next session idea for it.
  This should be an outline of what should happen in the next session. Be creative and have fun with it.

  In your output outline, include a name and a detailed session outline.

  # Campaign Basic Info:
  Name: ${campaign.name}
  Description: ${campaign.description}
  Additional Info: ${additional ?? 'None provided'}


  # Players:
  ${players
    .map((player) => {
      return `Name: ${player.name}\n Level: ${player.level}\n Class: ${player.details?.class?.name}\n Background: ${player.details?.background?.name}\n Ancestry: ${player.details?.ancestry?.name} \n Details: ${JSON.stringify(player.details?.info ?? {})}\n`;
    })
    .join('\n\n-----\n\n')}


  # Campaign Notes:
  ${campaign.notes?.pages
    .filter((_page, index) => notePages.includes(index))
    ?.map((page) => '### ' + page.name + '\n' + convertTiptapToMarkdown(page.contents))
    .join('\n\n')}

      
  # Output Format:
  {
    name: string;
    outline: string;
  }


  Use markdown to format your output. at the Only return the JSON object with the information filled in. DO NOT INCLUDE \`\`\`json\`\`\` in your response.
  # Output:
  `.trim();
  const result = await generateCompletion(prompt, 'gpt-4o-mini');

  try {
    const r = yaml.load(result ?? '') as any;
    const actions = await generateSessionIdeaActions(r.outline);
    return {
      name: r.name,
      outline: r.outline.replace(/^### .+\n/, ''),
      actions: actions?.actions ?? [],
    };
  } catch (e) {
    console.warn('Failed to parse response', e);
    return null;
  }
}

async function generateSessionIdeaActions(
  outline: string
): Promise<{ actions: { name: string; description: string; type: 'NPC' | 'ENCOUNTER' }[] } | null> {
  const prompt = `
  I’m going to give you an outline for a Pathfinder / Starfinder / D&D campaign session and I need you to generate some optional actions that includes info that could be used in the future to produce the NPCs or encounters for the session.
  These could be a basic outline of an NPC for the session or an basic description of an encounter in the session.

  
  # Session Outline:
  ${outline}


  # Output Format:
  {
    actions: {
      name: string;
      description: string;
      type: 'NPC' | 'ENCOUNTER';
    }[];
  }


  Use markdown to format your output. Only return the JSON object with the information filled in. DO NOT INCLUDE \`\`\`json\`\`\` in your response.
  # Output:
  `.trim();
  const result = await generateCompletion(prompt, 'gpt-4o-mini');
  try {
    return yaml.load(result ?? '') as any;
  } catch (e) {
    console.warn('Failed to parse response', e);
    return null;
  }
}

/**
 * Uses AI to detect potential content links.
 * - Potential content links are wrapped in double square brackets.
 * @param text
 */
export async function detectPotentialContentLinks(description: string) {
  const prompt = `
  # Your job is it to detect potential content links in a description for Pathfinder 2e. IMPORTANT: Your response should only be the exact same as the description but with any potential content links wrapped in double brackets.

  # Examples:
  ### Input:
  You change your grip on the shield, allowing you to combine rapid attacks with your shield boss or shield spikes and your main weapon’s Strikes in a series of swift motions. You reduce your [[shield boss]] and shield spikes weapon damage die to 1d4 and your Strikes gain the agile weapon trait. You can use Agile Shield Grip again to switch to a normal grip, which removes the agile trait.
  ### Output:
  You change your grip on the shield, allowing you to combine rapid attacks with your [[shield boss]] or [[shield spikes]] and your main weapon’s [[Strikes]] in a series of swift motions. You reduce your [[shield boss]] and [[shield spikes]] weapon damage die to 1d4 and your [[Strikes]] gain the [[agile]] weapon trait. You can use [[Agile Shield Grip]] again to switch to a normal grip, which removes the [[agile]] trait.

  ### Input:
  Your deceptions confound even the most powerful mortal divinations. Detection, revelation, and scrying effects pass right over you, your possessions, and your auras, detecting nothing unless the detecting effect has a counteract level of 10 or higher. For example, detect magic would still detect other magic in the area but not any magic on you, true seeing wouldn’t reveal you, locate or scrying wouldn’t find you, and so on.
  ### Output:
  Your deceptions confound even the most powerful mortal divinations. [[Detection]], [[revelation]], and [[scrying]] effects pass right over you, your possessions, and your auras, detecting nothing unless the detecting effect has a counteract level of 10 or higher. For example, [[detect magic]] would still detect other magic in the area but not any magic on you, [[true seeing]] wouldn’t reveal you, [[locate]] or [[scrying]] wouldn’t find you, and so on.

  ### Input:
  You whip up a small sandstorm around your body. When a creature starts its turn in the area or moves into the area, it must succeed at a Fortitude save or become dazzled for as long as it remains in the area; it is then temporarily immune to this dazzling effect for 10 minutes. 
  Additionally, you direct a jet of sand at a single target. One creature of your choice within 30 feet takes 8d6 slashing damage (basic Reflex save). On a critical failure, the creature is also frightened 1 until the next time you Sustain the Spell or for 1 minute.
  ### Output:
  You whip up a small sandstorm around your body. When a creature starts its turn in the area or moves into the area, it must succeed at a Fortitude save or become [[dazzled]] for as long as it remains in the area; it is then temporarily immune to this [[dazzling]] effect for 10 minutes. 
  Additionally, you direct a jet of sand at a single target. One creature of your choice within 30 feet takes 8d6 slashing damage (basic Reflex save). On a critical failure, the creature is also [[frightened 1]] until the next time you [[Sustain the Spell]] or for 1 minute.

  Now it's your turn.
  ### Input:
  ${description}
  `.trim();
  return await generateCompletion(prompt);
}

export async function fixBackgroundContent(description: string) {
  const prompt = `
  Your job is to fix backgrounds. I'm going to give you 3 examples and then it'll be your turn to do the same thing.

# Example 1
———————————

## Input
> _You spent your early days in a religious monastery or cloister. You may have traveled out into the world to spread the message of your religion or because you cast away the teachings of your faith, but deep down, you'll always carry within you the lessons you learned._

Choose two attribute boosts. One must be to [Intelligence](link_trait_1613) or Wisdom, and one is a free attribute boost.

You're trained in the Religion skill and the Scribing Lore skill. You gain the [Student of the Canon](link_feat_20599) skill feat.

## Output
### Description:
> _You spent your early days in a religious monastery or cloister. You may have traveled out into the world to spread the message of your religion or because you cast away the teachings of your faith, but deep down, you'll always carry within you the lessons you learned._

Choose two attribute boosts. One must be to Intelligence or Wisdom, and one is a free attribute boost.

You're trained in the Religion skill and the Scribing Lore skill. You gain the Student of the Canon skill feat.
### Attribute Choice: [INT, WIS]
### Skills: [RELIGION, LORE_SCRIBING]
### Feat: [Student of the Canon]

———————————
# Example 2
———————————

## Input
> _To the common folk, the life of a noble seems one of idyllic luxury, but growing up as a noble or member of the aspiring gentry, you know the reality: a noble's lot is obligation and intrigue. Whether you seek to escape your duties by adventuring or to better your station, you have traded silks and pageantry for an adventurer's life._

Choose two attribute boosts. One must be to [Intelligence](link_trait_1613) or Charisma, and one is a free attribute boost.

You're trained in the Society skill and the Genealogy Lore or Heraldry Lore skill. You gain the [Courtly Graces](link_feat_20024) skill feat.

## Output
### Description:
> _To the common folk, the life of a noble seems one of idyllic luxury, but growing up as a noble or member of the aspiring gentry, you know the reality: a noble's lot is obligation and intrigue. Whether you seek to escape your duties by adventuring or to better your station, you have traded silks and pageantry for an adventurer's life._

Choose two attribute boosts. One must be to Intelligence or Charisma, and one is a free attribute boost.

You're trained in the Society skill and the Genealogy Lore or Heraldry Lore skill. You gain the Courtly Graces skill feat.
### Attribute Choice: [INT, CHA]
### Skills: [SOCIETY, NOT_SURE]
### Feat: [Courtly Graces]

———————————
# Example 3
———————————

## Input
> _You have been imprisoned or punished for crimes (whether you were guilty or not). Now that your sentence has ended or you've escaped, you take full advantage of the newfound freedom of your adventuring life._

Choose two attribute boosts. One must be to Strength or Constitution, and one is a free attribute boost.

You're trained in the [Stealth](link_feat_20586) skill and the Underworld Lore skill. You gain the [Experienced Smuggler](link_feat_20127) skill feat.

## Output
### Description:
> _You have been imprisoned or punished for crimes (whether you were guilty or not). Now that your sentence has ended or you've escaped, you take full advantage of the newfound freedom of your adventuring life._

Choose two attribute boosts. One must be to Strength or Constitution, and one is a free attribute boost.

You're trained in the Stealth skill and the Underworld Lore skill. You gain the Experienced Smuggler skill feat.
### Attribute Choice: [STR, CON]
### Skills: [STEALTH, LORE_UNDERWORLD]
### Feat: [Experienced Smuggler]

———————————

If you come across any lore where it’s more complicated than just “you’re trained in <blank> Lore”, just say NOT_SURE.


Okay, now it’s your turn:

## Input
${description}

## Output`.trim();

  const result = (await generateCompletion(prompt)) ?? '';

  const obj = {
    description: '',
    attributeChoice: [] as string[],
    skills: [] as string[],
    feat: '',
  };

  // Extract Description
  const descriptionMatch = result.match(/Description:\s*(>\s*.*?)\s*###\s*/s);
  if (descriptionMatch) {
    obj.description = descriptionMatch[1].trim();
  }

  // Extract Attribute Choice
  const attributeChoiceMatch = result.match(/Attribute Choice: \[(.+?)\]/);
  if (attributeChoiceMatch) {
    obj.attributeChoice = attributeChoiceMatch[1].split(',').map((x) => x.trim());
  }

  // Extract Skills
  const skillsMatch = result.match(/Skills: \[(.+?)\]/);
  if (skillsMatch) {
    obj.skills = skillsMatch[1].split(',').map((x) => x.trim());
  }

  // Extract Feat
  const featMatch = result.match(/Feat: \[(.+?)\]/);
  if (featMatch) {
    obj.feat = featMatch[1].trim();
  }

  return obj;
}
