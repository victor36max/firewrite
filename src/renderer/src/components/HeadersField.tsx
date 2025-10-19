import { useState } from 'react'
import { Label } from './primitives/Label'
import { IconButton } from './primitives/IconButton'
import { LuMinus, LuPlus } from 'react-icons/lu'
import { Input } from './primitives/Input'
import { TextField } from 'react-aria-components'
import { FieldError } from './primitives/FieldError'

interface HeadersFieldProps {
  defaultValue: Record<string, string> | undefined
}

export const HeadersField = ({ defaultValue }: HeadersFieldProps) => {
  const [headerEntries, setHeaderEntries] = useState<[string, string][]>(
    defaultValue ? Object.entries(defaultValue) : []
  )

  const addHeader = (name: string, value: string) => {
    setHeaderEntries([...headerEntries, [name, value]])
  }

  const removeHeader = (index: number) => {
    setHeaderEntries(headerEntries.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 items-center justify-between">
        <Label>Custom Headers (Optional)</Label>
        <IconButton Icon={LuPlus} size="sm" onClick={() => addHeader('', '')} />
      </div>
      {headerEntries.map(([name, value], index) => (
        <div className="flex flex-row gap-2 items-center" key={index}>
          <TextField
            className="flex-1"
            name={`headers[${index}].name`}
            defaultValue={name}
            onChange={(value) =>
              setHeaderEntries([
                ...headerEntries.slice(0, index),
                [value, headerEntries[index][1]],
                ...headerEntries.slice(index + 1)
              ])
            }
            aria-label={`header-name-${index + 1}`}
          >
            <Input placeholder="Name" />
            <FieldError />
          </TextField>
          <TextField
            className="flex-1"
            name={`headers[${index}].value`}
            defaultValue={value}
            onChange={(value) =>
              setHeaderEntries([
                ...headerEntries.slice(0, index),
                [name, value],
                ...headerEntries.slice(index + 1)
              ])
            }
            aria-label={`header-value-${index + 1}`}
          >
            <Input placeholder="Value" />
            <FieldError />
          </TextField>
          <IconButton Icon={LuMinus} size="sm" onClick={() => removeHeader(index)} />
        </div>
      ))}
    </div>
  )
}
