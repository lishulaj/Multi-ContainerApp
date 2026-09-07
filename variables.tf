variable "project_id" {
  type        = string
  description = "GCP Project ID"
}

variable "region" {
  type    = string
  default = "europe-north2"
}

variable "zone" {
  type    = string
  default = "europe-north2-a"
}

variable "ssh_user" {
  type        = string
  description = "SSH username for VM access"
}

variable "ssh_pub_key_path" {
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
  description = "Path to pub SSH key"
}