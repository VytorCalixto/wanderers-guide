import { makeRequest } from '@requests/request-manager';

export async function generateCompletion(prompt?: string) {
  if (!prompt) return null;
  const result = await makeRequest<string>('open-ai-request', {
    content: prompt.trim(),
    model: 'gpt-4',
  });
  return result;
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
