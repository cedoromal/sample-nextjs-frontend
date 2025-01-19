"use client";

import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { useState } from "react";
import { Input } from "@heroui/input";
import { DatePicker } from "@heroui/date-picker";
import { parseDate } from "@internationalized/date";

import { ApiPersonsGetRequest } from "@/openapi";

export default function FilterPersonsModal({
  isOpen,
  onOpenChange,
  currentFilters = {},
  onApply = () => {},
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  currentFilters?: ApiPersonsGetRequest;
  onApply?: (filters: ApiPersonsGetRequest) => void;
}) {
  const [filters, setFilters] = useState(currentFilters);

  return (
    <>
      <Modal
        hideCloseButton
        isOpen={isOpen}
        size="xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Filter Persons
              </ModalHeader>
              <ModalBody>
                <>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input
                        defaultValue={filters.firstName}
                        label="First Name"
                        onValueChange={(value) => {
                          setFilters({
                            ...filters,
                            firstName: value,
                          });
                        }}
                      />
                      <Input
                        defaultValue={filters.lastName}
                        label="Last Name"
                        onValueChange={(value) => {
                          setFilters({
                            ...filters,
                            lastName: value,
                          });
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <DatePicker
                        defaultValue={
                          filters.birthDateMin
                            ? parseDate(
                                filters.birthDateMin
                                  .toISOString()
                                  .split("T")[0],
                              )
                            : undefined
                        }
                        label="Birth Date Min"
                        onChange={(value) => {
                          setFilters({
                            ...filters,
                            birthDateMin: value?.toDate("UTC"),
                          });
                        }}
                      />
                      <DatePicker
                        defaultValue={
                          filters.birthDateMax
                            ? parseDate(
                                filters.birthDateMax
                                  .toISOString()
                                  .split("T")[0],
                              )
                            : undefined
                        }
                        label="Birth Date Max"
                        onChange={(value) => {
                          setFilters({
                            ...filters,
                            birthDateMax: value?.toDate("UTC"),
                          });
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        defaultValue={filters.incomeMin?.toString()}
                        label="Income Min"
                        type="number"
                        onValueChange={(value) => {
                          setFilters({
                            ...filters,
                            incomeMin: value === "" ? undefined : Number(value),
                          });
                        }}
                      />
                      <Input
                        defaultValue={filters.incomeMax?.toString()}
                        label="Income Max"
                        type="number"
                        onValueChange={(value) => {
                          setFilters({
                            ...filters,
                            incomeMax: value === "" ? undefined : Number(value),
                          });
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        defaultValue={filters.balanceMin?.toString()}
                        label="Balance Min"
                        type="number"
                        onValueChange={(value) => {
                          setFilters({
                            ...filters,
                            balanceMin:
                              value === "" ? undefined : Number(value),
                          });
                        }}
                      />
                      <Input
                        defaultValue={filters.balanceMax?.toString()}
                        label="Balance Max"
                        type="number"
                        onValueChange={(value) => {
                          setFilters({
                            ...filters,
                            balanceMax:
                              value === "" ? undefined : Number(value),
                          });
                        }}
                      />
                    </div>
                  </div>
                </>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onApply(filters);
                  }}
                >
                  Apply
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
