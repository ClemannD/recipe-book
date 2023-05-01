// import type { Ingredient } from '@prisma/client';
import { Button } from '../ui/button';
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
    <div className="mb-2 grid grid-cols-10 gap-4">
      <div className="col-span-5">
        <Input name={`${namePrefix}.name`} type="text" hideErrorMessage />
      </div>
      <div className="col-span-2">
        <Input name={`${namePrefix}.quantity`} type="number" hideErrorMessage />
      </div>
      <div className="col-span-2">
        <Input name={`${namePrefix}.unit`} type="text" hideErrorMessage />
      </div>
      <div className="col-span-1">
        <Button
          variant="secondary"
          onClick={() => {
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
