$path = "ems-key-pair.pem"
$acl = Get-Acl $path

# Disable inheritance and remove all inherited rules
$acl.SetAccessRuleProtection($true, $false)

# Create a rule for the current user (Read only)
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule($env:USERNAME, "Read", "Allow")

# Add the rule
$acl.AddAccessRule($rule)

# Apply the changes
Set-Acl $path $acl

Write-Host "Permissions fixed for $path"
