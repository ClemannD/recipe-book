import type { RecipeType } from '@prisma/client';
import clsx from 'clsx';
import { Form, Formik } from 'formik';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
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
import useOnClickOutside from '../../utils/hooks/useClickOutside';
import { X } from 'lucide-react';

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
          {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4"> */}
          <div className="flex flex-wrap gap-4">
            {isLoading && (
              <>
                <Skeleton className="h-20 min-w-[375px] max-w-[750px] flex-1" />
                <Skeleton className="h-20 min-w-[375px] max-w-[750px] flex-1" />
                <Skeleton className="h-20 min-w-[375px] max-w-[750px] flex-1" />
                <Skeleton className="h-20 min-w-[375px] max-w-[750px] flex-1" />
                <Skeleton className="h-20 min-w-[375px] max-w-[750px] flex-1" />
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

            {/* Hack because I want flex wrap but with all elements to maintain their size */}
            <div className="h-1 min-w-[375px] max-w-[750px] flex-1"></div>
            <div className="h-1 min-w-[375px] max-w-[750px] flex-1"></div>
            <div className="h-1 min-w-[375px] max-w-[750px] flex-1"></div>
            <div className="h-1 min-w-[375px] max-w-[750px] flex-1"></div>
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
  const recipeBoxRef = useRef<HTMLDivElement>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useOnClickOutside(recipeBoxRef, () => {
    if (!isPopoverOpen) {
      setIsEditing(false);
    }
  });

  return (
    <div
      ref={recipeBoxRef}
      className={clsx(
        'flex h-20 min-w-[375px] max-w-[750px] flex-1 items-center rounded bg-white p-4 shadow-sm',
        recipeType &&
          !isEditing &&
          'cursor-pointer transition-all ease-in-out hover:scale-[1.02]'
      )}
      onClick={() => {
        setIsEditing(true);
      }}
    >
      {isEditing || !recipeType ? (
        <RecipeTypeForm
          recipeType={recipeType}
          onSubmitted={onSubmitted}
          onPopoverOpened={() => {
            setIsPopoverOpen(true);
          }}
          onPopoverClosed={() => {
            setIsPopoverOpen(false);
          }}
        />
      ) : (
        <>
          <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 p-2 text-3xl">
            {recipeType.icon}
          </div>
          <h3 className="text-xl font-bold">{recipeType.name}</h3>
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

  onPopoverOpened,
  onPopoverClosed,
}: {
  recipeType?: RecipeType;
  onSubmitted: () => Promise<void>;
  onPopoverOpened?: () => void;
  onPopoverClosed?: () => void;
}) => {
  const { toast } = useToast();

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(emojiPickerRef, () => {
    setIsPopoverOpen(false);
  });

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

  const [deleteIsLoading, setDeleteIsLoading] = useState(false);
  const { mutate: deleteRecipeType } =
    api.recipeType.deleteRecipeType.useMutation({
      onMutate: () => {
        console.log('onMutate');
      },
      onSuccess: async () => {
        await onSubmitted();
        console.log('onSuccess');

        setDeleteIsLoading(false);
        toast({
          title: 'Recipe Type Deleted',
          description: 'Your recipe type has been deleted',
        });
      },
    });

  useEffect(() => {
    console.log('deleteIsLoading', deleteIsLoading);
  }, [deleteIsLoading]);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    if (isPopoverOpen) {
      onPopoverOpened?.();
    } else {
      onPopoverClosed?.();
    }
  }, [isPopoverOpen, onPopoverClosed, onPopoverOpened]);

  return (
    <div className="relative w-full">
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
                // onOpenChange={(isOpen) => setIsPopoverOpen(isOpen)}
              >
                <PopoverTrigger className="mr-4 ">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 p-2 text-3xl transition-all ease-in-out hover:scale-105"
                    onClick={(e) => {
                      setIsPopoverOpen(!isPopoverOpen);
                      e.stopPropagation();
                    }}
                  >
                    {values.icon}
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[350px] border-none p-0"
                  ref={emojiPickerRef}
                >
                  <Picker
                    onEmojiClick={(emoji) => {
                      setFieldValue('icon', emoji.emoji);
                      setIsPopoverOpen(false);
                    }}
                    skinTonesDisabled
                  />
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

              {recipeType && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="ml-2"
                  disabled={deleteIsLoading}
                  isSubmitting={deleteIsLoading}
                  onClick={() => {
                    toast({
                      title: `Are you sure you want to delete ${recipeType.name}?`,
                      description: 'This cannot be undone',
                      duration: 9000,
                      action: (
                        <Button
                          variant="destructive"
                          isSubmitting={deleteIsLoading}
                          // eslint-disable-next-line @typescript-eslint/no-misused-promises
                          onClick={(e) => {
                            deleteRecipeType({ id: recipeType.id });
                          }}
                        >
                          Delete
                        </Button>
                      ),
                    });
                  }}
                >
                  <X className="text-red-500 hover:text-red-600" />
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
