// import type { Ingredient } from '@prisma/client';
import Button, { ButtonAppearance } from '../button';
import Input from './input';

const IngredientInput = ({
  index,
  namePrefix,
  remove,
}: {
  index: number;
  namePrefix: string;
  remove: (index: number) => undefined;
}) => {
  return (
    <div className="grid grid-cols-10 gap-4">
      <div className="col-span-5">
        <Input name={`${namePrefix}.name`} type="text" />
      </div>
      <div className="col-span-2">
        <Input name={`${namePrefix}.quantity`} type="number" />
      </div>
      <div className="col-span-2">
        <Input name={`${namePrefix}.unit`} type="text" />
      </div>
      <div className="col-span-1 pt-1">
        <Button
          appearance={ButtonAppearance.Secondary}
          clickHandler={() => {
            remove(index);
          }}
        >
          🗑️
        </Button>
      </div>
    </div>
  );
};

export default IngredientInput;
