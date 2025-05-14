"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  SearchIcon,
  FilterIcon,
  MoreHorizontalIcon,
  StarIcon,
  ArrowUpDownIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  XIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  FileIcon,
  FileSpreadsheetIcon,
  ImageIcon,
  ArchiveIcon,
  FileIcon as FilePresentation,
  GridIcon,
  ListIcon,
} from "lucide-react"
import { getDocuments, toggleFavorite, downloadDocument, formatFileSize } from "@/lib/document-api"
import {
  type Document,
  type DocumentListParams,
  FILE_TYPES,
  DOCUMENT_CATEGORIES,
  DOCUMENT_TAGS,
} from "@/lib/document-types"
import DocumentsPagination from "./documents-pagination"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DocumentsListProps {
  initialParams?: Partial<DocumentListParams>;
  hideFilters?: boolean;
}

export function DocumentsList({ initialParams, hideFilters = false }: DocumentsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(
    initialParams?.page || Number.parseInt(searchParams.get("page") || "1")
  )
  const [perPage, setPerPage] = useState(
    initialParams?.perPage || Number.parseInt(searchParams.get("per_page") || "10")
  )

  // Sorting state
  const [sortBy, setSortBy] = useState(
    initialParams?.sortBy || searchParams.get("sort_by") || "uploadDate"
  )
  const [sortOrder, setSortOrder] = useState(
    (initialParams?.order || searchParams.get("order") || "desc") as "asc" | "desc"
  )

  // Filtering state
  const [searchTerm, setSearchTerm] = useState(initialParams?.search || "")
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    initialParams?.filters?.type || []
  )
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialParams?.filters?.category || []
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialParams?.filters?.tags || []
  )
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    initialParams?.filters?.dateFrom ? new Date(initialParams.filters.dateFrom) : undefined
  )
  const [dateTo, setDateTo] = useState<Date | undefined>(
    initialParams?.filters?.dateTo ? new Date(initialParams.filters.dateTo) : undefined
  )
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(
    initialParams?.filters?.favorites || false
  )

  // Load documents data
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true)
      try {
        // Backend API doesn't support pagination, sorting, or filtering
        // So we simply fetch all documents and apply filters on the client side
        const params: DocumentListParams = {
          page: 1,
          perPage: 100, // Set a high value to get all documents
          sortBy: "uploadDate",
          order: "desc",
          // Other params ignored by backend but used for local filtering
          search: searchTerm,
          filters: {
            type: selectedTypes.length > 0 ? selectedTypes : undefined,
            category: selectedCategories.length > 0 ? selectedCategories : undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            dateFrom: dateFrom ? dateFrom.toISOString() : undefined,
            dateTo: dateTo ? dateTo.toISOString() : undefined,
            favorites: showFavoritesOnly,
            // Include folder filter if provided in initialParams
            folderId: initialParams?.filters?.folderId
          },
        }

        const response = await getDocuments(params)

        // Process the documents
        let processedDocs = []
        if (Array.isArray(response)) {
          // If response is just an array of documents
          processedDocs = response
        } else if (response.documents) {
          // If response is in our expected format with documents property
          processedDocs = response.documents
        } else {
          processedDocs = []
        }

        // Apply client-side filtering if needed
        let filteredDocs = processedDocs

        // Apply search filter if needed
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          filteredDocs = filteredDocs.filter(
            doc =>
              doc.name.toLowerCase().includes(searchLower) ||
              (doc.description && doc.description.toLowerCase().includes(searchLower))
          )
        }

        // Apply folder filter if specified
        if (initialParams?.filters?.folderId) {
          filteredDocs = filteredDocs.filter(
            doc => doc.folderId === initialParams.filters?.folderId
          )
        }

        // Set state with processed documents
        setDocuments(filteredDocs)
        setTotalDocuments(processedDocs.length)
        setTotalPages(1) // No pagination in the backend API
      } catch (error) {
        console.error("Failed to fetch documents:", error)
        setDocuments([])
        setTotalDocuments(0)
        setTotalPages(0)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()

    // No URL updates for pagination since backend doesn't support it
  }, [
    searchTerm,
    selectedTypes,
    selectedCategories,
    selectedTags,
    dateFrom,
    dateTo,
    showFavoritesOnly,
    initialParams?.filters?.folderId
  ])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      await toggleFavorite(id)
      // Update the document in the list
      setDocuments((docs) => docs.map((doc) => (doc.id === id ? { ...doc, favorited: !doc.favorited } : doc)))
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
    }
  }

  const handleDownload = async (id: string) => {
    try {
      await downloadDocument(id)
      // In a real app, this would trigger a file download
      alert("Download started (simulated)")
    } catch (error) {
      console.error("Failed to download document:", error)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedTypes([])
    setSelectedCategories([])
    setSelectedTags([])
    setDateFrom(undefined)
    setDateTo(undefined)
    setShowFavoritesOnly(false)
    setCurrentPage(1)
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDownIcon className="ml-2 h-4 w-4" />
    }
    return sortOrder === "asc" ? <ArrowUpIcon className="ml-2 h-4 w-4" /> : <ArrowDownIcon className="ml-2 h-4 w-4" />
  }

  const getFileIcon = (type: string) => {
    const fileType = FILE_TYPES[type as keyof typeof FILE_TYPES] || FILE_TYPES.default

    switch (fileType.icon) {
      case "FileTextIcon":
        return <FileTextIcon className={`h-5 w-5 ${fileType.color}`} />
      case "FileSpreadsheetIcon":
        return <FileSpreadsheetIcon className={`h-5 w-5 ${fileType.color}`} />
      case "FilePresentation":
        return <FilePresentation className={`h-5 w-5 ${fileType.color}`} />
      case "ImageIcon":
        return <ImageIcon className={`h-5 w-5 ${fileType.color}`} />
      case "ArchiveIcon":
        return <ArchiveIcon className={`h-5 w-5 ${fileType.color}`} />
      default:
        return <FileIcon className={`h-5 w-5 ${fileType.color}`} />
    }
  }

  return (
    <Card>
      <CardHeader className="px-6 py-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Showing {documents.length} of {totalDocuments} documents
            </CardDescription>
          </div>
          {!hideFilters && (
            <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
              <div className="flex space-x-1">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <GridIcon className="h-4 w-4" />
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <FilterIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px]">
                  <DropdownMenuLabel>Filter Documents</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <div className="p-2">
                    <p className="mb-1 text-xs font-medium">File Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(FILE_TYPES)
                        .filter((type) => type !== "default")
                        .map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={selectedTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTypes([...selectedTypes, type])
                                } else {
                                  setSelectedTypes(selectedTypes.filter((t) => t !== type))
                                }
                                setCurrentPage(1)
                              }}
                            />
                            <label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                              {type.toUpperCase()}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <div className="p-2">
                    <p className="mb-1 text-xs font-medium">Category</p>
                    <div className="grid grid-cols-1 gap-2">
                      {DOCUMENT_CATEGORIES.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategories([...selectedCategories, category])
                              } else {
                                setSelectedCategories(selectedCategories.filter((c) => c !== category))
                              }
                              setCurrentPage(1)
                            }}
                          />
                          <label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <div className="p-2">
                    <p className="mb-1 text-xs font-medium">Tags</p>
                    <div className="grid grid-cols-2 gap-2">
                      {DOCUMENT_TAGS.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTags([...selectedTags, tag])
                              } else {
                                setSelectedTags(selectedTags.filter((t) => t !== tag))
                              }
                              setCurrentPage(1)
                            }}
                          />
                          <label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <div className="p-2">
                    <p className="mb-1 text-xs font-medium">Upload Date</p>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs mb-1">From</p>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !dateFrom && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <p className="text-xs mb-1">To</p>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !dateTo && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <div className="p-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="favorites-only"
                        checked={showFavoritesOnly}
                        onCheckedChange={(checked) => {
                          setShowFavoritesOnly(!!checked)
                          setCurrentPage(1)
                        }}
                      />
                      <label htmlFor="favorites-only" className="text-sm cursor-pointer">
                        Show favorites only
                      </label>
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button variant="outline" className="w-full" onClick={clearFilters}>
                      <XIcon className="mr-2 h-4 w-4" />
                      Clear all filters
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {!hideFilters && (
          <div className="border-b px-6 py-3">
            <form onSubmit={handleSearch} className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="w-full appearance-none bg-background pl-8 md:max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>
        )}

        {/* Active filters display */}
        {!hideFilters &&
          (selectedTypes.length > 0 ||
            selectedCategories.length > 0 ||
            selectedTags.length > 0 ||
            dateFrom ||
            dateTo ||
            showFavoritesOnly) && (
            <div className="border-b px-6 py-2 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Active filters:</span>

              {selectedTypes.map((type) => (
                <Badge key={`type-${type}`} variant="outline" className="flex items-center gap-1">
                  {type.toUpperCase()}
                  <XIcon
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedTypes(selectedTypes.filter((t) => t !== type))}
                  />
                </Badge>
              ))}

              {selectedCategories.map((category) => (
                <Badge key={`category-${category}`} variant="outline" className="flex items-center gap-1">
                  {category}
                  <XIcon
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== category))}
                  />
                </Badge>
              ))}

              {selectedTags.map((tag) => (
                <Badge key={`tag-${tag}`} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <XIcon
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                  />
                </Badge>
              ))}

              {dateFrom && (
                <Badge variant="outline" className="flex items-center gap-1">
                  From: {format(dateFrom, "PP")}
                  <XIcon className="h-3 w-3 cursor-pointer" onClick={() => setDateFrom(undefined)} />
                </Badge>
              )}

              {dateTo && (
                <Badge variant="outline" className="flex items-center gap-1">
                  To: {format(dateTo, "PP")}
                  <XIcon className="h-3 w-3 cursor-pointer" onClick={() => setDateTo(undefined)} />
                </Badge>
              )}

              {showFavoritesOnly && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Favorites only
                  <XIcon className="h-3 w-3 cursor-pointer" onClick={() => setShowFavoritesOnly(false)} />
                </Badge>
              )}
            </div>
          )}

        {viewMode === "list" ? (
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center">
                      Document
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("type")}>
                    <div className="flex items-center">
                      Type
                      {getSortIcon("type")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("size")}>
                    <div className="flex items-center">
                      Size
                      {getSortIcon("size")}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("uploadDate")}>
                    <div className="flex items-center">
                      Uploaded
                      {getSortIcon("uploadDate")}
                    </div>
                  </TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: perPage }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="h-16 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ))
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-16 text-center">
                      No documents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFavorite(document.id)}
                          className={document.favorited ? "text-yellow-500" : ""}
                        >
                          <StarIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                            {getFileIcon(document.type)}
                          </div>
                          <div>
                            <div className="font-medium">
                              <Link href={`/documents/${document.id}`} className="hover:underline">
                                {document.name}
                              </Link>
                            </div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {document.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{document.type.toUpperCase()}</TableCell>
                      <TableCell>{formatFileSize(document.size)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{format(new Date(document.uploadDate), "PP")}</span>
                          <span className="text-xs text-muted-foreground">by {document.uploader.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {document.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(document.id)}
                            title="Download"
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                          <Link href={`/documents/${document.id}`}>
                            <Button variant="ghost" size="icon" title="View">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontalIcon className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/documents/${document.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/documents/${document.id}/edit`}>Edit Metadata</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(document.id)}>Download</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {loading ? (
              Array.from({ length: perPage }).map((_, i) => (
                <div key={i} className="h-[200px] rounded-lg bg-muted animate-pulse"></div>
              ))
            ) : documents.length === 0 ? (
              <div className="col-span-full text-center py-8">No documents found.</div>
            ) : (
              documents.map((document) => (
                <div key={document.id} className="border rounded-lg overflow-hidden flex flex-col">
                  <div className="p-4 bg-muted flex items-center justify-center h-32">{getFileIcon(document.type)}</div>
                  <div className="p-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        <Link href={`/documents/${document.id}`} className="hover:underline">
                          {document.name}
                        </Link>
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFavorite(document.id)}
                        className={document.favorited ? "text-yellow-500" : ""}
                      >
                        <StarIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">{document.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{formatFileSize(document.size)}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(document.uploadDate), "PP")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {document.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {document.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{document.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="border-t p-2 flex justify-end space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(document.id)} title="Download">
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                    <Link href={`/documents/${document.id}`}>
                      <Button variant="ghost" size="icon" title="View">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/documents/${document.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/documents/${document.id}/edit`}>Edit Metadata</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(document.id)}>Download</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Only show pagination if more than one page */}
        {totalPages > 1 && (
          <DocumentsPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </CardContent>
    </Card>
  )
}

