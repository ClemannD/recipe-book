import type { RecipeType } from '@prisma/client';
import clsx from 'clsx';
import { Categories } from 'emoji-picker-react';
import { Form, Formik } from 'formik';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import Input from '../../components/forms/input';
import Layout from '../../components/layout';
import { Button } from '../../components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { Skeleton } from '../../components/ui/skeleton';
import { useToast } from '../../components/ui/toast/use-toast';
import { api } from '../../utils/api';

const RecipeTypePage: React.FC = () => {
  const {
    data: recipeTypes,
    isLoading,
    refetch,
  } = api.recipeType.getRecipeTypes.useQuery();

  return (
    <Layout>
      <div className="p-10">
        <h1 className="text-3xl font-bold">Recipe Types</h1>
        <h2 className="mt-1 text-xl text-gray-600">
          Recipe Types are used to categorize your recipes
        </h2>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {isLoading && (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            )}

            {recipeTypes?.map((recipeType) => (
              <RecipeTypeBox
                key={recipeType.id + recipeType.name + recipeType.icon}
                recipeType={recipeType}
                onSubmitted={async () => {
                  await refetch();
                }}
              />
            ))}

            <RecipeTypeBox
              onSubmitted={async () => {
                await refetch();
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecipeTypePage;

const RecipeTypeBox = ({
  recipeType,
  onSubmitted,
}: {
  recipeType?: RecipeType;
  onSubmitted: () => Promise<void>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // const [targetIdsToIgnore, setTargetIdsToIgnore] = useState<string[]>([]);

  // useClickOutside(
  //   ref,
  //   () => {
  //     setIsEditing(false);
  //   },
  //   targetIdsToIgnore
  // );

  return (
    <div
      ref={ref}
      className={clsx(
        'flex h-24 items-center rounded bg-white p-4 shadow-sm',
        recipeType &&
          'cursor-pointer transition-all ease-in-out hover:scale-[1.02]'
      )}
      onClick={() => {
        setIsEditing(!isEditing);
      }}
    >
      {isEditing || !recipeType ? (
        <RecipeTypeForm
          recipeType={recipeType}
          onSubmitted={onSubmitted}
          // setEmojiPickerTargetId={(targetId) => {
          //   console.log('targetId', targetId);
          //   setTargetIdsToIgnore((prev) => [...prev, targetId]);
          // }}
        />
      ) : (
        <>
          <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 p-2 text-4xl">
            {recipeType.icon}
          </div>
          <h3 className="text-2xl font-bold">{recipeType.name}</h3>
        </>
      )}
    </div>
  );
};

const Picker = dynamic(
  () => {
    return import('emoji-picker-react');
  },
  { ssr: false }
);

const RecipeTypeForm = ({
  recipeType,
  onSubmitted,
}: // setEmojiPickerTargetId,
{
  recipeType?: RecipeType;
  onSubmitted: () => Promise<void>;
  // setEmojiPickerTargetId: (id: string) => void;
}) => {
  const { toast } = useToast();

  // const emojiPickerRef = useRef<HTMLElement>(null);

  // useEffect(() => {
  //   if (emojiPickerRef.current) {
  //     setEmojiPickerTargetId(emojiPickerRef.current.id);
  //   }
  // }, [emojiPickerRef.current?.id]);

  const recipeTypeSchema = z.object({
    name: z.string().nonempty(),
    icon: z.string().nonempty(),
  });

  const { mutateAsync: createRecipeType, isLoading: createIsLoading } =
    api.recipeType.createRecipeType.useMutation({
      onSuccess: async () => {
        await onSubmitted();
        toast({
          title: 'Recipe Type Created',
          description: 'Your recipe type has been created',
        });
      },
    });

  const { mutateAsync: updateRecipeType, isLoading: updateIsLoading } =
    api.recipeType.updateRecipeType.useMutation({
      onSuccess: async () => {
        await onSubmitted();
        toast({
          title: 'Recipe Type Updated',
          description: 'Your recipe type has been updated',
        });
      },
    });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <div className="w-full">
      <Formik
        initialValues={{
          name: recipeType?.name ?? '',
          icon: recipeType?.icon ?? '🥘',
        }}
        validationSchema={toFormikValidationSchema(recipeTypeSchema)}
        onSubmit={async (values, { resetForm }) => {
          console.log('values', values);
          if (!recipeType) {
            await createRecipeType(values);
            resetForm();
          } else {
            await updateRecipeType({ ...values, id: recipeType?.id });
            resetForm();
          }

          resetForm();
        }}
      >
        {({ setFieldValue, values }) => (
          <Form>
            <div className="flex items-center">
              <Popover
                open={isPopoverOpen}
                onOpenChange={(isOpen) => setIsPopoverOpen(isOpen)}
              >
                <PopoverTrigger>
                  <div
                    className="mr-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 p-2 text-4xl transition-all ease-in-out hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPopoverOpen(!isPopoverOpen);
                    }}
                  >
                    {values.icon}
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto border-none p-0"
                  // ref={emojiPickerRef}
                >
                  <div>
                    <Picker
                      onEmojiClick={(emoji, e: MouseEvent) => {
                        console.log('emoji', emoji);
                        setFieldValue('icon', emoji.emoji);
                        setIsPopoverOpen(false);
                      }}
                      // searchDisabled
                      skinTonesDisabled
                      categories={[
                        {
                          name: 'Food & Drink',
                          category: Categories.FOOD_DRINK,
                        },
                        {
                          name: 'Animals',
                          category: Categories.ANIMALS_NATURE,
                        },
                        {
                          name: 'Objects',
                          category: Categories.OBJECTS,
                        },
                      ]}
                    />
                  </div>
                </PopoverContent>
              </Popover>

              <Input
                name="name"
                placeholder="Create new Type"
                className="mb-0 mr-4 flex-grow"
                hideErrorMessage
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className=""
                disabled={
                  values.name.length === 0 || createIsLoading || updateIsLoading
                }
                isSubmitting={createIsLoading || updateIsLoading}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {recipeType ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
