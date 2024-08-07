import { RichTextEditor } from '@mantine/tiptap';
import { JSONContent, useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { useMantineTheme, Text, Box, FocusTrap } from '@mantine/core';
import { ContentLink } from './ContentLinkExtension';
import ContentLinkControl from './ContentLinkControl';
import { useRecoilState } from 'recoil';
import { drawerState } from '@atoms/navAtoms';
import { toMarkdown } from '@content/content-utils';
import { ActionSymbol } from './ActionSymbolExtension';
import ActionSymbolControl from './ActionSymbolControl';
import Placeholder from '@tiptap/extension-placeholder';
import { useDisclosure, useElementSize } from '@mantine/hooks';
import AutoContentLinkControl from './AutoContentLinkControl';

interface RichTextInputProps {
  label?: string;
  required?: boolean;
  value?: string | JSONContent;
  onChange?: (text: string, json: JSONContent) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextInput(props: RichTextInputProps) {
  const theme = useMantineTheme();
  const _drawerState = useRecoilState(drawerState);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      ContentLink(_drawerState),
      ActionSymbol,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: props.placeholder }),
    ],
    content: props.value ?? '',
    onUpdate({ editor }) {
      if (props.onChange) {
        console.log(editor.getHTML(), toMarkdown(editor.getHTML()) ?? '');
        props.onChange(toMarkdown(editor.getHTML()) ?? '', editor.getJSON());
      }
    },
  });

  const [active, { toggle }] = useDisclosure(false);

  const { ref, width, height } = useElementSize();
  const isSmall = width < 510;
  const isVerySmall = width < 395;

  return (
    <Box>
      {props.label && (
        <Text fz='sm' c='gray.4' fw={500}>
          {props.label}{' '}
          {props.required && (
            <Text fz='sm' fw={500} c='red' span>
              *
            </Text>
          )}
        </Text>
      )}

      <RichTextEditor
        ref={ref}
        editor={editor}
        fz='sm'
        styles={{
          toolbar: {
            backgroundColor: theme.colors.dark[7],
          },
          content: {
            backgroundColor: theme.colors.dark[6],
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            minHeight: props.minHeight ? props.minHeight - 50 : undefined,
          },
        }}
      >
        <RichTextEditor.Toolbar
          style={isSmall ? { gap: 0, justifyContent: 'space-between' } : { gap: 5, flexWrap: 'nowrap' }}
        >
          <RichTextEditor.ControlsGroup>
            <ActionSymbolControl />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <ContentLinkControl />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>

          {!isVerySmall && (
            <RichTextEditor.ControlsGroup>
              {/* <RichTextEditor.H1 /> */}
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
              <RichTextEditor.H4 />
            </RichTextEditor.ControlsGroup>
          )}
          {!isVerySmall && (
            <RichTextEditor.ControlsGroup>
              <AutoContentLinkControl />
            </RichTextEditor.ControlsGroup>
          )}
        </RichTextEditor.Toolbar>

        <FocusTrap active={active}>
          <Box onClick={toggle} style={{ cursor: 'text' }}>
            <RichTextEditor.Content />
          </Box>
        </FocusTrap>
      </RichTextEditor>
    </Box>
  );
}
