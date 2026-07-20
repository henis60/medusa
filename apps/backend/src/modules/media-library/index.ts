import MediaLibraryModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const MEDIA_LIBRARY_MODULE = "mediaLibrary"

export default Module(MEDIA_LIBRARY_MODULE, {
  service: MediaLibraryModuleService,
})
