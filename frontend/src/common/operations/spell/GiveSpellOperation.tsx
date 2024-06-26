import { SelectContentButton } from '@common/select/SelectContent';
import { Spell } from '@typing/content';
import { OperationWrapper } from '../Operations';
import { Group, NumberInput, SegmentedControl, Stack, TextInput, Text } from '@mantine/core';
import { useState } from 'react';
import { useDidUpdate } from '@mantine/hooks';
import { GiveSpellData } from '@typing/operations';
import { labelToVariable } from '@variables/variable-utils';

export function GiveSpellOperation(props: {
  data: GiveSpellData;
  onSelect: (data: GiveSpellData) => void;
  onRemove: () => void;
}) {
  const [spellId, setSpellId] = useState(props.data.spellId);
  const [type, setType] = useState(props.data.type);
  const [castingSource, setCastingSource] = useState(props.data.castingSource);
  const [rank, setRank] = useState(props.data.rank);
  const [defaultRank, setDefaultRank] = useState(props.data.rank);
  const [tradition, setTradition] = useState(props.data.tradition);
  const [casts, setCasts] = useState(props.data.casts);

  useDidUpdate(() => {
    props.onSelect({
      spellId,
      type,
      castingSource,
      rank: rank ?? defaultRank,
      tradition,
      casts,
    });
  }, [spellId, type, castingSource, rank, tradition, casts]);

  return (
    <OperationWrapper onRemove={props.onRemove} title='Give Spell'>
      <Stack w='100%'>
        <Group>
          <SelectContentButton<Spell>
            type='spell'
            onClick={(option) => {
              setSpellId(option.id);
              setDefaultRank(option.rank);
            }}
            selectedId={props.data.spellId}
            options={{
              showButton: false,
            }}
          />
          <SegmentedControl
            value={type}
            size='xs'
            onChange={(v) => setType(v as 'NORMAL' | 'FOCUS' | 'INNATE')}
            data={[
              { label: 'Normal', value: 'NORMAL' },
              { label: 'Focus', value: 'FOCUS' },
              { label: 'Innate', value: 'INNATE' },
            ]}
          />
        </Group>
        {type === 'NORMAL' && (
          <Group>
            <TextInput
              ff='Ubuntu Mono, monospace'
              size='xs'
              placeholder='Casting Source'
              w={190}
              value={castingSource}
              onChange={(e) => {
                setCastingSource(labelToVariable(e.target.value, false));
              }}
            />
            <NumberInput
              size='xs'
              placeholder='Rank'
              min={0}
              max={10}
              w={70}
              value={rank}
              onChange={(val) => setRank(parseInt(`${val}`))}
              allowDecimal={false}
            />
          </Group>
        )}
        {type === 'FOCUS' && (
          <Group>
            <TextInput
              ff='Ubuntu Mono, monospace'
              size='xs'
              placeholder='Casting Source'
              w={190}
              value={castingSource}
              onChange={(e) => {
                setCastingSource(labelToVariable(e.target.value, false));
              }}
            />
          </Group>
        )}
        {type === 'INNATE' && (
          <Group>
            <SegmentedControl
              value={tradition}
              size='xs'
              onChange={(v) => setTradition(v as 'ARCANE' | 'OCCULT' | 'PRIMAL' | 'DIVINE')}
              data={[
                { label: 'Arcane', value: 'ARCANE' },
                { label: 'Divine', value: 'DIVINE' },
                { label: 'Occult', value: 'OCCULT' },
                { label: 'Primal', value: 'PRIMAL' },
              ]}
            />
            <NumberInput
              size='xs'
              placeholder='Rank'
              min={0}
              max={10}
              w={70}
              value={rank}
              onChange={(val) => setRank(parseInt(`${val}`))}
              allowDecimal={false}
            />
            <NumberInput
              size='xs'
              placeholder='Casts'
              rightSection={<Text fz='xs'>/day</Text>}
              min={0}
              max={10}
              w={90}
              value={casts}
              onChange={(val) => setCasts(parseInt(`${val}`))}
              allowDecimal={false}
            />
          </Group>
        )}
      </Stack>
    </OperationWrapper>
  );
}
