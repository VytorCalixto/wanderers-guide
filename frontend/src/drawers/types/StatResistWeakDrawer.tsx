import { drawerState } from '@atoms/navAtoms';
import { ActionSymbol } from '@common/Actions';
import IndentedText from '@common/IndentedText';
import RichText from '@common/RichText';
import TraitsDisplay from '@common/TraitsDisplay';
import { ActionSelectionOption, FeatSelectionOption } from '@common/select/SelectContent';
import { ICON_BG_COLOR, ICON_BG_COLOR_HOVER, TEXT_INDENT_AMOUNT } from '@constants/data';
import { fetchContentAll, fetchContentById } from '@content/content-store';
import {
  Title,
  Text,
  Image,
  Loader,
  Group,
  Divider,
  Stack,
  Box,
  Flex,
  Badge,
  Accordion,
  Kbd,
  Timeline,
  HoverCard,
  List,
} from '@mantine/core';
import { useHover } from '@mantine/hooks';
import {
  IconBadgesFilled,
  IconBlockquote,
  IconCaretLeftRight,
  IconFrame,
  IconGitBranch,
  IconGitCommit,
  IconGitPullRequest,
  IconMathSymbols,
  IconMessageDots,
  IconPlusMinus,
  IconTimeline,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { AbilityBlock } from '@typing/content';
import { VariableListStr, VariableNum, VariableProf } from '@typing/variables';
import { sign } from '@utils/numbers';
import {
  displayFinalProfValue,
  getBonusText,
  getFinalVariableValue,
  getProfValueParts,
  getVariableBreakdown,
} from '@variables/variable-display';
import { getAllSpeedVariables, getVariable, getVariableBonuses, getVariableHistory } from '@variables/variable-manager';
import {
  compileExpressions,
  getProficiencyTypeValue,
  isProficiencyType,
  isProficiencyValue,
  proficiencyTypeToLabel,
  variableNameToLabel,
  variableToLabel,
} from '@variables/variable-utils';
import * as _ from 'lodash-es';
import { useState } from 'react';
import { useRecoilState } from 'recoil';

export function StatResistWeakDrawerTitle(props: { data: {} }) {
  return (
    <>
      {
        <Group justify='space-between' wrap='nowrap'>
          <Group wrap='nowrap' gap={10}>
            <Box>
              <Title order={3}>Resistances & Weaknesses</Title>
            </Box>
          </Group>
        </Group>
      }
    </>
  );
}

export function StatResistWeakDrawerContent(props: { data: {} }) {
  const resistVar = getVariable<VariableListStr>('CHARACTER', 'RESISTANCES');
  const weakVar = getVariable<VariableListStr>('CHARACTER', 'WEAKNESSES');
  const immuneVar = getVariable<VariableListStr>('CHARACTER', 'IMMUNITIES');

  return (
    <>
      <Stack gap={10}>
        <Box>
          <Title order={4}>Resistances</Title>
          <Accordion
            variant='separated'
            defaultValue='options'
            styles={{
              label: {
                paddingTop: 5,
                paddingBottom: 5,
              },
              control: {
                paddingLeft: 13,
                paddingRight: 13,
              },
              item: {
                marginTop: 0,
                marginBottom: 5,
              },
            }}
          >
            <Accordion.Item value='description'>
              <Accordion.Control>
                <Group wrap='nowrap' justify='space-between' gap={0}>
                  <Text c='gray.5' fw={700} fz='sm'>
                    Description
                  </Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <RichText ta='justify' storeID='CHARACTER'>
                  {`If you have resistance to a type of damage, each time you take that type of damage, reduce the amount
                  of damage you take by the listed number (to a minimum of 0 damage). \n\n If you have more than one type of
                  resistance that would apply to the same instance of damage, use only the highest applicable resistance
                  value.`}
                </RichText>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value='options'>
              <Accordion.Control>
                <Group wrap='nowrap' justify='space-between' gap={0}>
                  <Text c='gray.5' fw={700} fz='sm'>
                    Active
                  </Text>
                  <Badge mr='sm' variant='outline' color='gray.5' size='xs'>
                    <Text fz='sm' c='gray.5' span>
                      {resistVar?.value.length}
                    </Text>
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <List>
                  {resistVar?.value.map((opt, index) => (
                    <List.Item key={index}>
                      <Text c='gray.5' size='md' span>
                        {compileExpressions('CHARACTER', opt.replace(',', ' '), true)}
                      </Text>
                    </List.Item>
                  ))}
                  {resistVar?.value.length === 0 && (
                    <Text fz='sm' c='dimmed' ta='center' fs='italic'>
                      No resistances found.
                    </Text>
                  )}
                </List>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>
        <Box>
          <Title order={4}>Weaknesses</Title>
          <Accordion
            variant='separated'
            defaultValue='options'
            styles={{
              label: {
                paddingTop: 5,
                paddingBottom: 5,
              },
              control: {
                paddingLeft: 13,
                paddingRight: 13,
              },
              item: {
                marginTop: 0,
                marginBottom: 5,
              },
            }}
          >
            <Accordion.Item value='description'>
              <Accordion.Control>
                <Group wrap='nowrap' justify='space-between' gap={0}>
                  <Text c='gray.5' fw={700} fz='sm'>
                    Description
                  </Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <RichText ta='justify' storeID='CHARACTER'>
                  {`If you have a weakness to a certain type of damage or damage from a certain source, that type of
                  damage is extra effective against you. Whenever you would take that type of damage, increase the
                  damage you take by the value of the weakness. For instance, if you are dealt 2d6 fire damage and have
                  weakness 5 to fire, you take 2d6+5 fire damage. \n\n If you have a weakness to something that doesn't
                  normally deal damage, such as water, you take damage equal to the weakness value when touched or
                  affected by it.`}
                </RichText>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value='options'>
              <Accordion.Control>
                <Group wrap='nowrap' justify='space-between' gap={0}>
                  <Text c='gray.5' fw={700} fz='sm'>
                    Active
                  </Text>
                  <Badge mr='sm' variant='outline' color='gray.5' size='xs'>
                    <Text fz='sm' c='gray.5' span>
                      {weakVar?.value.length}
                    </Text>
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <List>
                  {weakVar?.value.map((opt, index) => (
                    <List.Item key={index}>
                      <Text c='gray.5' size='md' span>
                        {variableNameToLabel(opt)}
                      </Text>
                    </List.Item>
                  ))}
                  {weakVar?.value.length === 0 && (
                    <Text fz='sm' c='dimmed' ta='center' fs='italic'>
                      No weaknesses found.
                    </Text>
                  )}
                </List>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>
        <Box>
          <Title order={4}>Immunities</Title>
          <Accordion
            variant='separated'
            defaultValue='options'
            styles={{
              label: {
                paddingTop: 5,
                paddingBottom: 5,
              },
              control: {
                paddingLeft: 13,
                paddingRight: 13,
              },
              item: {
                marginTop: 0,
                marginBottom: 5,
              },
            }}
          >
            <Accordion.Item value='description'>
              <Accordion.Control>
                <Group wrap='nowrap' justify='space-between' gap={0}>
                  <Text c='gray.5' fw={700} fz='sm'>
                    Description
                  </Text>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <RichText ta='justify' storeID='CHARACTER'>
                  {`When you have immunity to a specific type of damage, you ignore all damage of that type. If you have
                  immunity to a specific condition or type of effect, you can't be affected by that condition or any
                  effect of that type. You can still be targeted by an ability that includes an effect or condition you
                  are immune to; you just don't apply that particular effect or condition. \n\n If you have immunity to
                  effects with a certain trait (such as death effects, poison, or disease), you are unaffected by
                  effects with that trait. Often, an effect both has a trait and deals that type of damage (such as a
                  lightning bolt spell). In these cases, the immunity applies to the effect corresponding to the trait,
                  not just the damage. However, some complex effects might have parts that affect you even if you’re
                  immune to one of the effect’s traits; for instance, a spell that deals both fire and acid damage can
                  still deal acid damage to you even if you’re immune to fire.`}
                </RichText>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value='options'>
              <Accordion.Control>
                <Group wrap='nowrap' justify='space-between' gap={0}>
                  <Text c='gray.5' fw={700} fz='sm'>
                    Active
                  </Text>
                  <Badge mr='sm' variant='outline' color='gray.5' size='xs'>
                    <Text fz='sm' c='gray.5' span>
                      {immuneVar?.value.length}
                    </Text>
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <List>
                  {immuneVar?.value.map((opt, index) => (
                    <List.Item key={index}>
                      <Text c='gray.5' size='md' span>
                        {variableNameToLabel(opt)}
                      </Text>
                    </List.Item>
                  ))}
                  {immuneVar?.value.length === 0 && (
                    <Text fz='sm' c='dimmed' ta='center' fs='italic'>
                      No immunities found.
                    </Text>
                  )}
                </List>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Box>
      </Stack>
    </>
  );
}
