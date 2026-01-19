"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Breadcrumb, { BreadcrumbItem } from "@/components/common/Breadcrumb";
import EquipmentPanel from "@/components/equipment/EquipmentPanel";
import * as api from "@/services/api";
import type { School, Grade, ClassEquipmentList, EquipmentItem } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

export default function ClassesPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;

  const [school, setSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Equipment panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Grade | null>(null);
  const [equipmentList, setEquipmentList] = useState<ClassEquipmentList | null>(
    null
  );
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [schoolData, classesData] = await Promise.all([
          api.getSchoolById(schoolId),
          api.getGradesBySchool(schoolId),
        ]);
        setSchool(schoolData);
        setClasses(classesData);
      } catch (error) {
        console.error("Failed to load school data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [schoolId]);

  const openEquipmentPanel = useCallback(async (classInfo: Grade) => {
    setSelectedClass(classInfo);
    setIsPanelOpen(true);
    setIsLoadingEquipment(true);

    try {
      const equipment = await api.getEquipmentList(classInfo.id);
      setEquipmentList(equipment);
    } catch (error) {
      console.error("Failed to load equipment:", error);
    } finally {
      setIsLoadingEquipment(false);
    }
  }, []);

  const closeEquipmentPanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedClass(null);
    setEquipmentList(null);
  }, []);

  const handleAddItem = useCallback(
    async (item: Omit<EquipmentItem, "id">) => {
      if (!selectedClass) return;
      const updated = await api.addEquipmentItem(selectedClass.id, item);
      setEquipmentList(updated);
    },
    [selectedClass]
  );

  const handleUpdateItem = useCallback(
    async (itemId: string, updates: Partial<Omit<EquipmentItem, "id">>) => {
      if (!selectedClass) return;
      const updated = await api.updateEquipmentItem(
        selectedClass.id,
        itemId,
        updates
      );
      setEquipmentList(updated);
    },
    [selectedClass]
  );

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      if (!selectedClass) return;
      const updated = await api.deleteEquipmentItem(selectedClass.id, itemId);
      setEquipmentList(updated);
    },
    [selectedClass]
  );

  const breadcrumbItems: BreadcrumbItem[] = [{ label: "Schools", href: "/schools" }];
  if (school) {
    breadcrumbItems.push({ label: school.name });
  }

  return (
    <>
      <Breadcrumb
        pageTitle={school ? `${school.name} - Classes` : "Classes"}
        items={breadcrumbItems}
      />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Classes
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Click on a class to view and manage its equipment list.
          </p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-brand-500 rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-500">Loading classes...</span>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-800 dark:text-white/90">
                No classes found
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This school doesn&apos;t have any classes yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                    >
                      Class Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                    >
                      Level
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                    >
                      Students
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-center text-sm dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {classes.map((classItem) => (
                    <TableRow
                      key={classItem.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => openEquipmentPanel(classItem)}
                    >
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 dark:bg-success-500/10">
                            <svg
                              className="h-5 w-5 text-success-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white/90">
                            {classItem.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        {classItem.level ? (
                          <Badge color="primary">Grade {classItem.level}</Badge>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-start text-sm">
                        {classItem.studentCount
                          ? `${classItem.studentCount} students`
                          : "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEquipmentPanel(classItem);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-500 bg-brand-50 rounded-lg hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors"
                        >
                          Equipment List
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Panel */}
      <EquipmentPanel
        isOpen={isPanelOpen}
        onClose={closeEquipmentPanel}
        classInfo={selectedClass}
        equipmentList={equipmentList}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        isLoading={isLoadingEquipment}
      />
    </>
  );
}

