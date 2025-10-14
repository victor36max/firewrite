import {
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  Button as AriaButton,
  SelectValue as AriaSelectValue,
  Popover,
  ListBox,
  ListBoxItem
} from 'react-aria-components'
import { LuChevronDown } from 'react-icons/lu'
import { cn } from '@renderer/utils'

export interface SelectProps extends AriaSelectProps {
  items: {
    label: string
    value: string
    icon?: React.ReactNode
  }[]
}

export const Select = (props: SelectProps) => {
  return (
    <AriaSelect {...props}>
      <AriaButton
        className={
          'w-full flex flex-row justify-between items-center p-2 border border-muted rounded-lg outline-primary placeholder:text-muted-foreground cursor-pointer bg-background'
        }
      >
        <AriaSelectValue>
          {({ isPlaceholder, defaultChildren }) => (
            <span className={isPlaceholder ? 'text-muted-foreground' : ''}>{defaultChildren}</span>
          )}
        </AriaSelectValue>
        <LuChevronDown className="w-5 h-5" />
      </AriaButton>
      <Popover className="w-(--trigger-width)">
        <ListBox className="border border-muted rounded-lg bg-background max-h-60 overflow-y-auto">
          {props.items.map((item, index) => (
            <ListBoxItem
              className={({ isFocused, isHovered, isSelected }) =>
                cn(
                  'p-2 outline-none cursor-pointer',
                  index !== 0 && 'border-t border-muted',
                  isFocused && 'bg-muted-light',
                  isHovered && 'bg-muted-light',
                  isSelected && 'bg-primary/10'
                )
              }
              id={item.value}
              textValue={item.label}
              key={item.value}
            >
              <div className="flex flex-row gap-2 items-center">
                {item.icon}
                {item.label}
              </div>
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  )
}
