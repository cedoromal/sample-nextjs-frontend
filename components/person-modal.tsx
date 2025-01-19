"use client";

import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";
import { Input } from "@heroui/input";
import { DatePicker } from "@heroui/date-picker";
import { parseDate } from "@internationalized/date";

import { Person, PersonsApi } from "@/openapi";
import { ApiContext } from "@/app/providers";

export default function PersonModal({
  isOpen,
  onOpenChange,
  title,
  personId,
  onSave = () => {},
  isBusy = false,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  title: string;
  personId?: Person["personId"];
  onSave?: (person: Person) => void;
  isBusy?: boolean;
}) {
  const apiContext = useContext(ApiContext);
  const personsApi = new PersonsApi(apiContext.apiConfig);

  const fieldsFallback: Person = {
    firstName: "",
    lastName: "",
    birthDate: new Date(Date.now()),
    balance: 0,
    income: 0,
  };

  const [fields, setFields] = useState<Person>(fieldsFallback);

  const apiPersonsIdGetResponse = useQuery({
    queryKey: ["apiPersonsIdGet", personId],
    queryFn: () => personsApi.apiPersonsIdGet({ id: personId! }),
    enabled: false,
  });

  useEffect(() => {
    if (typeof personId === "undefined") return;
    apiPersonsIdGetResponse.refetch();
  }, [personId, isOpen]);

  useEffect(() => {
    if (typeof apiPersonsIdGetResponse.data !== "undefined")
      setFields(apiPersonsIdGetResponse.data);
    else setFields(fieldsFallback);
  }, [apiPersonsIdGetResponse.data]);

  return (
    <>
      <Modal
        hideCloseButton
        isDismissable={!isBusy}
        isOpen={isOpen}
        size="xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
              <ModalBody>
                {personId && apiPersonsIdGetResponse.isPending && (
                  <>
                    <Spinner label="Looking for that Person..." />
                  </>
                )}

                {(!personId || apiPersonsIdGetResponse.isSuccess) && (
                  <>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Input
                          defaultValue={apiPersonsIdGetResponse.data?.firstName.trim()}
                          label="First Name"
                          onValueChange={(value) => {
                            setFields({
                              ...fields,
                              firstName: value,
                            });
                          }}
                        />
                        <Input
                          defaultValue={apiPersonsIdGetResponse.data?.lastName.trim()}
                          label="Last Name"
                          onValueChange={(value) => {
                            setFields({
                              ...fields,
                              lastName: value,
                            });
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <DatePicker
                          defaultValue={
                            apiPersonsIdGetResponse.data
                              ? parseDate(
                                  apiPersonsIdGetResponse.data.birthDate
                                    .toISOString()
                                    .split("T")[0],
                                )
                              : undefined
                          }
                          label="Birth Date"
                          onChange={(value) => {
                            if (value)
                              setFields({
                                ...fields,
                                birthDate: value.toDate("UTC"),
                              });
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          defaultValue={apiPersonsIdGetResponse.data?.income.toString()}
                          label="Income"
                          type="number"
                          onValueChange={(value) => {
                            setFields({
                              ...fields,
                              income: Number(value),
                            });
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          defaultValue={apiPersonsIdGetResponse.data?.balance.toString()}
                          label="Balance"
                          type="number"
                          onValueChange={(value) => {
                            setFields({
                              ...fields,
                              balance: Number(value),
                            });
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button isDisabled={isBusy} variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isDisabled={
                    (personId && apiPersonsIdGetResponse.isPending) || isBusy
                  }
                  onPress={() => {
                    onSave({
                      ...fields,
                      personId: personId,
                      firstName: fields.firstName.trim(),
                      lastName: fields.lastName.trim(),
                    });
                  }}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
